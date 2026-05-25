import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";
import { createHash, randomUUID } from "crypto";
import { ELEVENLABS_API_KEY, VOICE_ID, synthesize } from "./providers/elevenlabs";

const MAX_TEXT_LENGTH = 2000;

// Liest einen Text per ElevenLabs vor. Cacht das Ergebnis in Firebase Storage
// (Schlüssel = Hash aus Stimme + Text): erster Aufruf synthetisiert + speichert,
// jeder weitere liefert sofort die gecachte Datei (keine erneuten Kosten).
// Gibt eine Download-URL (mit Token) zurück, die das Frontend direkt abspielen kann.
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
    if (text.length > MAX_TEXT_LENGTH) {
      throw new HttpsError("invalid-argument", "Text ist zu lang zum Vorlesen.");
    }

    const hash = createHash("sha256").update(`${VOICE_ID}|${text}`).digest("hex").slice(0, 40);
    const bucket = getStorage().bucket();
    const file = bucket.file(`tts/${hash}.mp3`);

    const [exists] = await file.exists();
    if (!exists) {
      const audio = await synthesize(text);
      await file.save(audio, {
        resumable: false,
        metadata: {
          contentType: "audio/mpeg",
          metadata: { firebaseStorageDownloadTokens: randomUUID() },
        },
      });
    }

    const [meta] = await file.getMetadata();
    const token = meta.metadata?.firebaseStorageDownloadTokens;
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
    return { url, cached: exists };
  }
);
