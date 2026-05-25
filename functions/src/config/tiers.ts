export type Difficulty = "leicht" | "mittel" | "schwer";

export const DIFFICULTIES: Difficulty[] = ["leicht", "mittel", "schwer"];

export interface TierModels {
  text: string[];
  image: string[];
}

// Datengetriebenes Mapping Stufe -> Modelle. Pro Stufe eine Liste:
// heute je ein Modell, später beliebig erweiterbar – der Proxy wählt dann
// pro Runde eines aus (siehe pickModel). Modellnamen hier zentral pflegen.
export const TIER_MODELS: Record<Difficulty, TierModels> = {
  leicht: {
    text: ["openai/gpt-3.5-turbo"],
    image: ["black-forest-labs/flux-schnell"],
  },
  mittel: {
    text: ["google/gemini-2.5-flash"],
    image: ["black-forest-labs/flux-dev"],
  },
  schwer: {
    text: ["anthropic/claude-opus-4.7"],
    image: ["black-forest-labs/flux-1.1-pro"],
  },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as string[]).includes(value);
}

export function pickModel(models: string[], rng: () => number = Math.random): string {
  if (models.length === 0) throw new Error("Keine Modelle für diese Stufe konfiguriert.");
  return models[Math.floor(rng() * models.length)];
}

// --- Modell-Metadaten (für die Stufen-Anzeige im Spiel: Lerneffekt) ---------

export interface ModelInfo {
  id: string;
  label: string;
  provider: string;
  info: string;
}

const MODEL_INFO: Record<string, Omit<ModelInfo, "id">> = {
  "openai/gpt-3.5-turbo": {
    label: "GPT-3.5 Turbo",
    provider: "OpenAI",
    info: "Ende 2022 – das Modell hinter dem ersten ChatGPT. Heute klein und älter; formuliert oft glatt und etwas generisch.",
  },
  "google/gemini-2.0-flash-001": {
    label: "Gemini 2.0 Flash",
    provider: "Google",
    info: "Modernes, schnelles Mittelklasse-Modell für flüssige Texte in Echtzeit.",
  },
  "google/gemini-2.5-flash": {
    label: "Gemini 2.5 Flash",
    provider: "Google",
    info: "Aktuelles, schnelles Google-Modell – flüssig und schon spürbar überzeugender.",
  },
  "anthropic/claude-sonnet-4.5": {
    label: "Claude Sonnet 4.5",
    provider: "Anthropic",
    info: "Starkes Modell – sehr gut darin, Stil und feine Nuancen zu imitieren.",
  },
  "anthropic/claude-opus-4.7": {
    label: "Claude Opus 4.7",
    provider: "Anthropic",
    info: "Aktuelles Spitzenmodell von Anthropic – täuschend echte Imitation von Stil und Nuancen, kaum von Menschenhand zu unterscheiden.",
  },
  "black-forest-labs/flux-schnell": {
    label: "FLUX.1 [schnell]",
    provider: "Black Forest Labs",
    info: "Schnelle, destillierte Variante – weniger Details, dadurch eher als KI erkennbar.",
  },
  "black-forest-labs/flux-dev": {
    label: "FLUX.1 [dev]",
    provider: "Black Forest Labs",
    info: "Hochwertiges, offenes Bildmodell mit guter Detailtreue.",
  },
  "black-forest-labs/flux-1.1-pro": {
    label: "FLUX 1.1 Pro",
    provider: "Black Forest Labs",
    info: "Fotorealistisch und sehr detailreich – kaum von echter Malerei zu unterscheiden.",
  },
};

const TIER_INFO: Record<Difficulty, string> = {
  leicht:
    "Ältere bzw. kleinere Modelle. Ihre Schwächen – steife Sprache, Bild-Artefakte – sind oft mit bloßem Auge erkennbar.",
  mittel: "Moderne Mittelklasse: flüssig und solide. Mit genauem Blick lässt sich die KI noch enttarnen.",
  schwer: "Aktuelle Spitzenmodelle. Täuschend echt – hier merkst du, wie weit KI inzwischen ist.",
};

function infoFor(id: string): ModelInfo {
  const meta = MODEL_INFO[id];
  return { id, label: meta?.label ?? id, provider: meta?.provider ?? "", info: meta?.info ?? "" };
}

// Öffentliche Übersicht für die Stufen-Auswahl im Spiel.
export function tiersOverview() {
  return DIFFICULTIES.map((difficulty) => ({
    difficulty,
    beschreibung: TIER_INFO[difficulty],
    textModelle: TIER_MODELS[difficulty].text.map(infoFor),
    bildModelle: TIER_MODELS[difficulty].image.map(infoFor),
  }));
}
