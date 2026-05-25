import { defineSecret } from "firebase-functions/params";

export const REPLICATE_API_KEY = defineSecret("REPLICATE_API_KEY");

const BASE = "https://api.replicate.com/v1";
const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 40;
const MAX_CREATE_RETRIES = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Entschärft den übereifrigen NSFW-Filter (klassische Kunst löst ihn oft fälschlich aus).
// Flux-„pro" nutzt safety_tolerance (1=streng … 6=tolerant), die anderen disable_safety_checker.
function safetyInput(model: string): Record<string, unknown> {
  if (model.includes("pro")) return { safety_tolerance: 5 };
  return { disable_safety_checker: true };
}

interface Prediction {
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: unknown;
  error?: string;
  urls?: { get?: string };
}

async function createPrediction(model: string, prompt: string): Promise<Prediction> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${BASE}/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_KEY.value()}`,
        "Content-Type": "application/json",
        // Wartet synchron bis ~60s, spart in den meisten Fällen das Pollen.
        Prefer: "wait",
      },
      body: JSON.stringify({ input: { prompt, ...safetyInput(model) } }),
    });

    // 429 = Rate-Limit (z. B. bei wenig Replicate-Guthaben): mit Backoff erneut versuchen.
    if (response.status === 429 && attempt < MAX_CREATE_RETRIES) {
      const retryAfter = Number(response.headers.get("retry-after")) || 8;
      await sleep((retryAfter + 1) * 1000);
      continue;
    }
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Replicate (${model}) ${response.status}: ${detail}`);
    }
    return (await response.json()) as Prediction;
  }
}

// model: "owner/name" (offizielle Modelle). Gibt die URL des erzeugten Bildes zurück.
export async function generateImage(model: string, prompt: string): Promise<string> {
  let prediction = await createPrediction(model, prompt);
  prediction = await waitForCompletion(prediction);
  return extractImageUrl(prediction, model);
}

async function waitForCompletion(prediction: Prediction): Promise<Prediction> {
  let current = prediction;
  let polls = 0;
  while ((current.status === "starting" || current.status === "processing") && polls < MAX_POLLS) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const getUrl = current.urls?.get;
    if (!getUrl) break;
    const res = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY.value()}` },
    });
    current = (await res.json()) as Prediction;
    polls++;
  }
  if (current.status !== "succeeded") {
    throw new Error(`Replicate-Lauf ${current.status}: ${current.error ?? "unbekannt"}`);
  }
  return current;
}

function extractImageUrl(prediction: Prediction, model: string): string {
  const { output } = prediction;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new Error(`Replicate (${model}) lieferte kein Bild im erwarteten Format.`);
}
