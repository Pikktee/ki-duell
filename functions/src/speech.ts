import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ELEVENLABS_API_KEY } from "./providers/elevenlabs";
import { ensureSpeechCached, MAX_TTS_TEXT_LENGTH } from "./lib/tts";

// Liest einen Text per ElevenLabs vor. Caching + Storage-Logik steckt in lib/tts.ts
// (derselbe Cache wird bei der Challenge-Erzeugung vorgewärmt -> erster Klick sofort).
export const synthesizeSpeech = onCall(
  { secrets: [ELEVENLABS_API_KEY], timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung (auch anonym) erforderlich.");
    }
    const text = typeof request.data?.text === "string" ? request.data.text.trim() : "";
    if (!text) {
      throw new HttpsError("invalid-argument", "Kein Text übergeben.");
    }
    if (text.length > MAX_TTS_TEXT_LENGTH) {
      throw new HttpsError("invalid-argument", "Text ist zu lang zum Vorlesen.");
    }

    try {
      return await ensureSpeechCached(text);
    } catch (error) {
      throw new HttpsError("internal", error instanceof Error ? error.message : "Vorlesen fehlgeschlagen.");
    }
  }
);
