import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { generateTextCompletion } from "./providers/openrouter";
import { generateImage } from "./providers/replicate";
import { TIER_MODELS, pickModel, Difficulty, isDifficulty } from "./config/tiers";
import { isPlaceholderImage, LibraryEntry, Category, OriginalType } from "./lib/library";
import { listLibrary } from "./lib/libraryStore";
import { buildTextPrompt, buildImagePrompt } from "./lib/prompts";
import { persistImageFromUrl } from "./lib/storage";
import { prewarmSpeech } from "./lib/tts";
import { seededRandom, shuffle } from "./util/random";

const ROUNDS_TEXT = 3;
const ROUNDS_IMAGE = 3;
interface ChallengeItem {
  id: string;
  typ: OriginalType;
  inhalt: string;
}

export interface ChallengeRound {
  roundId: string;
  entryId: string; // Quelle in der Bibliothek (für Dedupe/Detail, nie an Spieler)
  kategorie: Category;
  kuenstler: string; // erst in der Auflösung an den Client, nicht während des Spiels
  thema: string; // dito
  quelle: string; // dito (Herkunft des echten Werks, für die Auswertung)
  fakeId: string; // serverseitig – die Lösung; nie an den Client vor der Auflösung
  model: string;
  items: ChallengeItem[];
}

export interface DailyChallenge {
  date: string;
  difficulty: Difficulty;
  rounds: ChallengeRound[];
  createdAt: number;
}

export function todayBerlin(): string {
  // en-CA liefert das Format YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function challengeId(date: string, difficulty: Difficulty): string {
  return `${date}_${difficulty}`;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, " ").trim();
}

// Verhindert, dass die KI (v. a. bei berühmten Werken) das Original wörtlich reproduziert.
function tooSimilar(a: string, b: string): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

async function buildRound(
  entry: LibraryEntry,
  index: number,
  difficulty: Difficulty,
  rng: () => number
): Promise<ChallengeRound> {
  const realId = `r${index}-real`;
  const fakeId = `r${index}-fake`;

  let fakeContent: string;
  let realContent = entry.original.inhalt;
  let model: string;
  if (entry.original.typ === "text") {
    model = pickModel(TIER_MODELS[difficulty].text, rng);
    fakeContent = await generateTextCompletion(model, buildTextPrompt(entry));
    if (tooSimilar(fakeContent, entry.original.inhalt)) {
      throw new Error(`KI-Text zu ähnlich zum Original (${entry.id}) – übersprungen`);
    }
  } else {
    model = pickModel(TIER_MODELS[difficulty].image, rng);
    const generatedUrl = await generateImage(model, buildImagePrompt(entry));
    // Beide Bilder auf identisches Quadrat normalisieren (kein Rand-Verräter) und
    // dauerhaft in Storage sichern (Replicate-URLs verfallen ohnehin).
    // Die KI-Fälschung zusätzlich altern (Weichzeichnung, Firnis-Stich, niedrigere WebP-Qualität),
    // damit sie nicht digital-glatter wirkt als die echte Museums-Reproduktion.
    fakeContent = await persistImageFromUrl(generatedUrl, { aged: true });
    realContent = await persistImageFromUrl(entry.original.inhalt);
  }

  // Sprachausgabe für Text-Runden vorab erzeugen (beide Werke), damit der erste
  // "Vorlesen"-Klick sofort aus dem Cache spielt. Best-effort: blockiert die Runde nie.
  if (entry.original.typ === "text") {
    await prewarmSpeech([realContent, fakeContent]);
  }

  const items = shuffle(
    [
      { id: realId, typ: entry.original.typ, inhalt: realContent },
      { id: fakeId, typ: entry.original.typ, inhalt: fakeContent },
    ],
    rng
  );

  return {
    roundId: `r${index}`,
    entryId: entry.id,
    kategorie: entry.kategorie,
    kuenstler: entry.kuenstler,
    thema: entry.thema,
    quelle: entry.original.quelle,
    fakeId,
    model,
    items,
  };
}

async function buildRounds(
  pool: LibraryEntry[],
  count: number,
  indexBase: number,
  difficulty: Difficulty,
  rng: () => number
): Promise<ChallengeRound[]> {
  // Robust: scheitert ein Eintrag (z. B. NSFW-Filter), wird er übersprungen und der nächste genommen.
  const rounds: ChallengeRound[] = [];
  for (const entry of pool) {
    if (rounds.length >= count) break;
    try {
      rounds.push(await buildRound(entry, indexBase + rounds.length, difficulty, rng));
    } catch (error) {
      console.warn(`Runde übersprungen (${entry.id}):`, error instanceof Error ? error.message : error);
    }
  }
  return rounds;
}

async function buildChallenge(date: string, difficulty: Difficulty): Promise<DailyChallenge> {
  // Eigener Seed je Stufe -> jede Stufe zieht andere Werke.
  const rng = seededRandom(challengeId(date, difficulty));
  const usable = (await listLibrary()).filter((entry) => !isPlaceholderImage(entry));
  const textPool = shuffle(usable.filter((entry) => entry.original.typ === "text"), rng);
  const imagePool = shuffle(usable.filter((entry) => entry.original.typ === "bild"), rng);

  // Feste Mischung: 3 Text- + 3 Bild-Runden, danach Reihenfolge mischen.
  const textRounds = await buildRounds(textPool, ROUNDS_TEXT, 0, difficulty, rng);
  const imageRounds = await buildRounds(imagePool, ROUNDS_IMAGE, ROUNDS_TEXT, difficulty, rng);
  const rounds = shuffle([...textRounds, ...imageRounds], rng);

  if (rounds.length === 0) {
    throw new Error("Keine Runde konnte erzeugt werden.");
  }
  return { date, difficulty, rounds, createdAt: Date.now() };
}

export async function ensureChallenge(date: string, difficulty: Difficulty): Promise<DailyChallenge> {
  const ref = getFirestore().collection("dailyChallenges").doc(challengeId(date, difficulty));
  const snap = await ref.get();
  if (snap.exists) return snap.data() as DailyChallenge;

  const challenge = await buildChallenge(date, difficulty);
  await ref.set(challenge);
  return challenge;
}

// Nur lesen – kein Generieren. Gibt null zurück, wenn keine Challenge existiert.
export async function getChallenge(
  date: string,
  difficulty: Difficulty
): Promise<DailyChallenge | null> {
  const snap = await getFirestore()
    .collection("dailyChallenges")
    .doc(challengeId(date, difficulty))
    .get();
  return snap.exists ? (snap.data() as DailyChallenge) : null;
}

// Erzwingt eine frische Challenge (überschreibt eine vorhandene) – für den Admin-Befehl.
export async function regenerateChallenge(
  date: string,
  difficulty: Difficulty
): Promise<DailyChallenge> {
  const challenge = await buildChallenge(date, difficulty);
  await getFirestore().collection("dailyChallenges").doc(challengeId(date, difficulty)).set(challenge);
  return challenge;
}

// Würfelt EINE Runde neu (neuer, noch nicht verwendeter Bibliothekseintrag) und
// speichert die aktualisierte Challenge. Behält die roundId bei.
export async function rerollRound(
  date: string,
  difficulty: Difficulty,
  roundId: string
): Promise<DailyChallenge> {
  const challenge = await getChallenge(date, difficulty);
  if (!challenge) throw new Error("Challenge nicht vorhanden.");
  const idx = challenge.rounds.findIndex((round) => round.roundId === roundId);
  if (idx < 0) throw new Error("Runde nicht gefunden.");

  const used = new Set<string>();
  for (const round of challenge.rounds) {
    if (round.entryId) used.add(round.entryId);
    used.add(`${round.kuenstler}|${round.thema}`);
  }

  // Ersatz muss denselben Typ (Text/Bild) haben, damit die 3/3-Mischung erhalten bleibt.
  const roundTyp = challenge.rounds[idx].items[0]?.typ;
  const rng = seededRandom(`${challengeId(date, difficulty)}|reroll|${roundId}|${Date.now()}`);
  const pool = shuffle(
    (await listLibrary()).filter(
      (entry) =>
        !isPlaceholderImage(entry) &&
        entry.original.typ === roundTyp &&
        !used.has(entry.id) &&
        !used.has(`${entry.kuenstler}|${entry.thema}`)
    ),
    rng
  );

  const index = Number.parseInt(roundId.replace(/^r/, ""), 10);
  let replacement: ChallengeRound | null = null;
  for (const entry of pool) {
    try {
      replacement = await buildRound(entry, Number.isNaN(index) ? idx : index, difficulty, rng);
      break;
    } catch (error) {
      console.warn(`Reroll übersprungen (${entry.id}):`, error instanceof Error ? error.message : error);
    }
  }
  if (!replacement) throw new Error("Keine Ersatz-Runde erzeugbar.");

  challenge.rounds[idx] = replacement;
  await getFirestore().collection("dailyChallenges").doc(challengeId(date, difficulty)).set(challenge);
  return challenge;
}

// Entfernt vor der Auslieferung an den Client: Lösung (fakeId), Modell sowie
// Künstler/Thema/Quelle – Letztere kommen erst in der Auflösung (kein Googeln im Spiel).
function sanitizeRound(round: ChallengeRound) {
  return {
    roundId: round.roundId,
    kategorie: round.kategorie,
    items: round.items.map((item) => ({ id: item.id, typ: item.typ, inhalt: item.inhalt })),
  };
}

// Liefert die heutige Challenge der gewählten Stufe – NUR aus dem Cache, keine
// Lazy-Generierung. Fehlt sie, meldet die Antwort available:false (Frontend zeigt
// dann „keine Challenge verfügbar"). Generiert wird ausschließlich
// per Admin-Befehl (adminGenerateChallenge).
export const getDailyChallenge = onCall({ timeoutSeconds: 30 }, async (request) => {
  const { difficulty } = request.data ?? {};
  if (!isDifficulty(difficulty)) {
    throw new HttpsError("invalid-argument", "Unbekannte Schwierigkeitsstufe.");
  }
  const date = todayBerlin();
  const challenge = await getChallenge(date, difficulty);
  if (!challenge) {
    return { date, difficulty, available: false, rounds: [] };
  }
  return { date, difficulty, available: true, rounds: challenge.rounds.map(sanitizeRound) };
});
