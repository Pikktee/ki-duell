import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getChallenge, todayBerlin } from "./dailyChallenge";
import { isDifficulty, DIFFICULTIES } from "./config/tiers";
import { pointsFor } from "./lib/scoring";

function sanitizeName(name: unknown): string {
  if (typeof name !== "string") return "Anonym";
  const trimmed = name.trim().slice(0, 24);
  return trimmed.length > 0 ? trimmed : "Anonym";
}

function isAnonymous(token: { firebase?: { sign_in_provider?: string } }): boolean {
  return token.firebase?.sign_in_provider === "anonymous";
}

// Test-/Cheat-Modus: Spielername "Godmode" darf Challenges beliebig oft spielen.
// Solche Läufe werden NICHT gespeichert -> kein Tages-Lock, keine Ranglisten-Einträge.
function isGodmode(name: unknown): boolean {
  return typeof name === "string" && name.trim().toLowerCase() === "godmode";
}

// Fallback, falls kein Start erfasst wurde -> rankt im Tiebreaker zuletzt.
const FALLBACK_DURATION_MS = 60 * 60 * 1000;

// Markiert den Start eines Spiel-Laufs (für die Zeitmessung). Einmalig pro Tag/Stufe/
// Nutzer – erneutes Öffnen setzt die Zeit NICHT zurück.
export const startDailyRun = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Anmeldung (auch anonym) erforderlich.");
  }
  const { difficulty, displayName } = request.data ?? {};
  if (!isDifficulty(difficulty)) {
    throw new HttpsError("invalid-argument", "Unbekannte Schwierigkeitsstufe.");
  }
  const date = todayBerlin();
  const ref = getFirestore()
    .collection("runStarts")
    .doc(`${date}_${difficulty}_${request.auth.uid}`);
  // Godmode: Start jedes Mal zurücksetzen (frische Zeitmessung bei Mehrfach-Tests).
  if (isGodmode(displayName) || !(await ref.get()).exists) {
    await ref.set({ uid: request.auth.uid, date, difficulty, startedAt: Date.now() });
  }
  return { ok: true };
});

// Wertet die Tages-Challenge einer Stufe serverseitig aus (Lösung liegt nur hier
// vor), schreibt genau einen Versuch pro Tag/Stufe ins Tages-Leaderboard und –
// bei eingeloggten (nicht-anonymen) Nutzern – ins kombinierte Global-Ranking.
// Gibt die Auflösung (Fälschung + Modell je Runde) für den Lernmoment zurück.
export const submitDailyScore = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Anmeldung (auch anonym) erforderlich.");
  }
  const { difficulty, guesses, displayName } = request.data ?? {};
  if (!isDifficulty(difficulty)) {
    throw new HttpsError("invalid-argument", "Unbekannte Schwierigkeitsstufe.");
  }
  if (guesses === null || typeof guesses !== "object") {
    throw new HttpsError("invalid-argument", "Ungültige Antworten.");
  }

  const uid = request.auth.uid;
  const date = todayBerlin();
  const db = getFirestore();
  const godmode = isGodmode(displayName);

  // Ein Versuch pro Tag und Stufe (Godmode ausgenommen).
  const dailyRef = db.collection("dailyScores").doc(`${date}_${difficulty}_${uid}`);
  if (!godmode && (await dailyRef.get()).exists) {
    throw new HttpsError("failed-precondition", "Diese Stufe hast du heute schon gespielt.");
  }

  const challenge = await getChallenge(date, difficulty);
  if (!challenge) {
    throw new HttpsError("failed-precondition", "Für heute gibt es keine Challenge in dieser Stufe.");
  }
  let correct = 0;
  for (const round of challenge.rounds) {
    if ((guesses as Record<string, unknown>)[round.roundId] === round.fakeId) {
      correct++;
    }
  }
  const score = correct * pointsFor(difficulty);
  const name = sanitizeName(displayName);
  const anonymous = isAnonymous(request.auth.token);

  // Serverseitige Zeitmessung: Dauer = jetzt − Start (aus startDailyRun).
  const startSnap = await db.collection("runStarts").doc(`${date}_${difficulty}_${uid}`).get();
  const startedAt = startSnap.exists ? (startSnap.data()?.startedAt as number | undefined) : undefined;
  const durationMs = startedAt ? Math.max(0, Date.now() - startedAt) : FALLBACK_DURATION_MS;

  // Godmode-Läufe werden NICHT gespeichert (kein Lock, keine Ranglisten-Einträge).
  if (!godmode) {
    await dailyRef.set({
      uid,
      displayName: name,
      score,
      correct,
      total: challenge.rounds.length,
      durationMs,
      date,
      difficulty,
      anonymous,
      createdAt: Date.now(),
    });

    // Gesamt-Meisterschaft: nur für eingeloggte Nutzer, kumulativ über alle Tage/Stufen.
    if (!anonymous) {
      await db.collection("globalScores").doc(uid).set(
        {
          uid,
          displayName: name,
          totalScore: FieldValue.increment(score),
          totalCorrect: FieldValue.increment(correct),
          totalDurationMs: FieldValue.increment(durationMs),
          challengesPlayed: FieldValue.increment(1),
          lastPlayed: date,
        },
        { merge: true }
      );
    }
  }

  return {
    score,
    correct,
    total: challenge.rounds.length,
    durationMs,
    godmode,
    countsForGlobal: !anonymous && !godmode,
    reveal: challenge.rounds.map((round) => ({
      roundId: round.roundId,
      fakeId: round.fakeId,
      model: round.model,
      kuenstler: round.kuenstler,
      thema: round.thema,
      quelle: round.quelle,
    })),
  };
});

// Status pro Stufe HEUTE für den aktuellen Nutzer: null = noch nicht gespielt,
// sonst das erreichte Ergebnis. Für die Menü-Sperre + Punkteanzeige auf der Karte.
interface DailyResult {
  completed: boolean; // true = beendet (mit Ergebnis), false = gestartet/abgebrochen
  abandoned?: boolean;
  score?: number;
  correct?: number;
  total?: number;
  durationMs?: number;
}

// Status pro Stufe HEUTE: null = noch nicht angefangen (spielbar), sonst gesperrt –
// entweder beendet (mit Ergebnis) ODER gestartet/abgebrochen. Godmode ist nie gesperrt.
export const getMyDailyStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Anmeldung (auch anonym) erforderlich.");
  }
  const { displayName } = request.data ?? {};
  const date = todayBerlin();

  if (isGodmode(displayName)) {
    const open: Record<string, DailyResult | null> = {};
    for (const difficulty of DIFFICULTIES) open[difficulty] = null;
    return { date, results: open, godmode: true };
  }

  const uid = request.auth.uid;
  const db = getFirestore();
  const results: Record<string, DailyResult | null> = {};
  for (const difficulty of DIFFICULTIES) {
    const scoreSnap = await db.collection("dailyScores").doc(`${date}_${difficulty}_${uid}`).get();
    if (scoreSnap.exists) {
      const data = scoreSnap.data() ?? {};
      results[difficulty] = {
        completed: true,
        score: data.score ?? 0,
        correct: data.correct ?? 0,
        total: data.total ?? 0,
        durationMs: data.durationMs ?? 0,
      };
      continue;
    }
    // Gestartet (runStarts vorhanden) aber nicht beendet -> gilt als verbraucht/abgebrochen.
    const startSnap = await db.collection("runStarts").doc(`${date}_${difficulty}_${uid}`).get();
    results[difficulty] = startSnap.exists ? { completed: false, abandoned: true } : null;
  }
  return { date, results };
});
