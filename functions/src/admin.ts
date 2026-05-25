import { onRequest, Request } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import type { Response } from "express";
import { OPENROUTER_API_KEY } from "./providers/openrouter";
import { REPLICATE_API_KEY } from "./providers/replicate";
import { DIFFICULTIES, isDifficulty, Difficulty } from "./config/tiers";
import { getChallenge, regenerateChallenge, rerollRound, todayBerlin } from "./dailyChallenge";
import { Category, Fame, LibraryEntry } from "./lib/library";
import { listLibrary, upsertLibraryEntry, deleteLibraryEntry, seedLibrary } from "./lib/libraryStore";

export const ADMIN_TOKEN = defineSecret("ADMIN_TOKEN");

const CATEGORIES: Category[] = ["gedicht", "prosa", "gemaelde"];
const FAMES: Fame[] = ["hoch", "mittel", "niedrig"];

function requireAdmin(req: Request, res: Response): boolean {
  const provided =
    req.get("x-admin-token") ?? (typeof req.query.token === "string" ? req.query.token : "");
  if (!provided || provided !== ADMIN_TOKEN.value()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function requestedDate(req: Request): string {
  return typeof req.query.date === "string" && req.query.date ? req.query.date : todayBerlin();
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Liest den Request-Body robust aus – unabhängig davon, ob die Laufzeit den
// Body bereits geparst hat. Akzeptiert sowohl JSON als auch
// application/x-www-form-urlencoded (manche Deployments parsen JSON nicht
// automatisch; dann steht der Rohinhalt in req.rawBody).
function parseBody(req: Request): Record<string, unknown> {
  const body: unknown = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) {
    return body as Record<string, unknown>;
  }

  let raw = "";
  if (typeof body === "string") raw = body;
  else if (Buffer.isBuffer(body)) raw = body.toString("utf8");
  else if (req.rawBody) raw = req.rawBody.toString("utf8");
  raw = raw.trim();
  if (!raw) return {};

  const contentType = req.get("content-type") ?? "";
  try {
    if (contentType.includes("application/x-www-form-urlencoded") || (!raw.startsWith("{") && raw.includes("="))) {
      return Object.fromEntries(new URLSearchParams(raw)) as Record<string, unknown>;
    }
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// Validiert und normalisiert einen rohen Eintrag aus der Admin-UI.
function normalizeEntry(raw: Record<string, unknown>): LibraryEntry {
  const kategorie = str(raw.kategorie) as Category;
  if (!CATEGORIES.includes(kategorie)) throw new Error("Ungültige Kategorie.");

  const bekanntheit = (str(raw.bekanntheit) || "mittel") as Fame;
  if (!FAMES.includes(bekanntheit)) throw new Error("Ungültige Bekanntheit.");

  const kuenstler = str(raw.kuenstler);
  const thema = str(raw.thema);
  const quelle = str(raw.quelle);
  const original = (raw.original as Record<string, unknown>) ?? {};
  const inhalt = str(original.inhalt ?? raw.inhalt);
  if (!kuenstler || !thema || !quelle || !inhalt) {
    throw new Error("kuenstler, thema, quelle und inhalt dürfen nicht leer sein.");
  }

  // typ ergibt sich aus der Kategorie (Gemälde = Bild, sonst Text).
  const typ = kategorie === "gemaelde" ? "bild" : "text";
  if (typ === "bild" && !/^https?:\/\//.test(inhalt)) {
    throw new Error("Bei Gemälden muss inhalt eine http(s)-Bild-URL sein.");
  }

  const id = str(raw.id) || `${slugify(kuenstler)}-${slugify(thema).slice(0, 20)}-${Date.now().toString(36)}`;
  return { id, kategorie, kuenstler, thema, bekanntheit, original: { typ, inhalt, quelle } };
}

// --- Challenges ------------------------------------------------------------

export const adminGenerateChallenge = onRequest(
  {
    cors: true,
    secrets: [ADMIN_TOKEN, OPENROUTER_API_KEY, REPLICATE_API_KEY],
    timeoutSeconds: 540,
    memory: "1GiB",
  },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const date = requestedDate(req);
    const requested = req.query.difficulty;
    const difficulties: Difficulty[] = isDifficulty(requested) ? [requested] : DIFFICULTIES;
    try {
      const generated: { difficulty: Difficulty; rounds: number }[] = [];
      for (const difficulty of difficulties) {
        const challenge = await regenerateChallenge(date, difficulty);
        generated.push({ difficulty, rounds: challenge.rounds.length });
      }
      res.json({ date, generated });
    } catch (error) {
      console.error("adminGenerateChallenge fehlgeschlagen:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unbekannter Fehler" });
    }
  }
);

export const adminGetChallenges = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const date = requestedDate(req);
    const status = [];
    for (const difficulty of DIFFICULTIES) {
      const challenge = await getChallenge(date, difficulty);
      status.push({
        difficulty,
        exists: challenge !== null,
        rounds: challenge?.rounds.length ?? 0,
        createdAt: challenge?.createdAt ?? null,
      });
    }
    res.json({ date, status });
  }
);

// Übersicht über mehrere Tage (Standard 7), pro Tag/Stufe der Status.
export const adminGetChallengeRange = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const from = requestedDate(req);
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const start = new Date(`${from}T00:00:00Z`);

    const result = [];
    for (let i = 0; i < days; i++) {
      const dateStr = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
      const status = [];
      for (const difficulty of DIFFICULTIES) {
        const challenge = await getChallenge(dateStr, difficulty);
        status.push({
          difficulty,
          exists: challenge !== null,
          rounds: challenge?.rounds.length ?? 0,
          createdAt: challenge?.createdAt ?? null,
        });
      }
      result.push({ date: dateStr, status });
    }
    res.json({ days: result });
  }
);

// Volle Challenge inkl. Lösung (welches Item Fälschung ist) + Modell – nur Admin.
export const adminGetChallengeDetail = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const difficulty = req.query.difficulty;
    if (!isDifficulty(difficulty)) {
      res.status(400).json({ error: "difficulty fehlt/ungültig." });
      return;
    }
    const date = requestedDate(req);
    const challenge = await getChallenge(date, difficulty);
    res.json({
      date,
      difficulty,
      exists: challenge !== null,
      rounds: challenge?.rounds ?? [],
    });
  }
);

// Würfelt eine einzelne Runde neu.
export const adminRerollRound = onRequest(
  {
    cors: true,
    secrets: [ADMIN_TOKEN, OPENROUTER_API_KEY, REPLICATE_API_KEY],
    timeoutSeconds: 300,
    memory: "1GiB",
  },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const difficulty = req.query.difficulty;
    const roundId = typeof req.query.roundId === "string" ? req.query.roundId : "";
    if (!isDifficulty(difficulty) || !roundId) {
      res.status(400).json({ error: "difficulty und roundId nötig." });
      return;
    }
    const date = requestedDate(req);
    try {
      const challenge = await rerollRound(date, difficulty, roundId);
      res.json({ date, difficulty, rounds: challenge.rounds });
    } catch (error) {
      console.error("adminRerollRound fehlgeschlagen:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unbekannter Fehler" });
    }
  }
);

// --- Bibliothek ------------------------------------------------------------

export const adminListLibrary = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ entries: await listLibrary() });
  }
);

export const adminSaveLibraryEntry = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const entry = normalizeEntry(parseBody(req));
      await upsertLibraryEntry(entry);
      res.json({ ok: true, entry });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Ungültiger Eintrag" });
    }
  }
);

export const adminDeleteLibraryEntry = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const id = (typeof req.query.id === "string" && req.query.id) || str(parseBody(req).id);
    if (!id) {
      res.status(400).json({ error: "id fehlt." });
      return;
    }
    await deleteLibraryEntry(id);
    res.json({ ok: true, id });
  }
);

export const adminSeedLibrary = onRequest(
  { cors: true, secrets: [ADMIN_TOKEN] },
  async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const force = req.query.force === "1" || req.query.force === "true";
    const seeded = await seedLibrary(force);
    res.json({ seeded });
  }
);
