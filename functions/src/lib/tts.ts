import { getStorage } from "firebase-admin/storage";
import { createHash, randomUUID } from "crypto";
import { VOICE_ID, synthesize } from "../providers/elevenlabs";

export const MAX_TTS_TEXT_LENGTH = 2000;

// Synthetisiert einen Text per ElevenLabs und cacht das MP3 in Firebase Storage
// (Schlüssel = Hash aus Stimme + Text -> tts/{hash}.mp3). Erster Aufruf erzeugt +
// speichert, jeder weitere liefert sofort die gecachte Datei. Gibt eine
// Download-URL (mit Token) zurück. Wird vom Callable (synthesizeSpeech) UND von der
// Challenge-Erzeugung (Vorab-Caching) genutzt – derselbe Hash garantiert den Treffer.
export async function ensureSpeechCached(rawText: string): Promise<{ url: string; cached: boolean }> {
  const text = rawText.trim();
  if (!text) throw new Error("Kein Text übergeben.");
  if (text.length > MAX_TTS_TEXT_LENGTH) throw new Error("Text ist zu lang zum Vorlesen.");

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

// Best-effort Vorab-Synthese (z. B. bei der Challenge-Erzeugung): Fehler werden
// geloggt, aber NICHT weitergereicht – fehlendes TTS darf eine Challenge nie scheitern
// lassen. Zu lange Texte werden still übersprungen (Callable würde sie ohnehin ablehnen).
export async function prewarmSpeech(texts: string[]): Promise<void> {
  for (const text of texts) {
    if (!text || text.trim().length > MAX_TTS_TEXT_LENGTH) continue;
    try {
      await ensureSpeechCached(text);
    } catch (error) {
      console.warn("TTS-Vorwärmung übersprungen:", error instanceof Error ? error.message : error);
    }
  }
}
