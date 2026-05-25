import { defineSecret } from "firebase-functions/params";

export const ELEVENLABS_API_KEY = defineSecret("ELEVENLABS_API_KEY");

// Standard-Stimme (ElevenLabs „Rachel"). Eine andere deutschsprachige Stimme aus der
// Voice-Library kann hier per Voice-ID eingetragen werden. eleven_multilingual_v2
// erkennt die Sprache automatisch (deutsche Texte werden deutsch gesprochen).
export const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

const ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

export async function synthesize(text: string): Promise<Buffer> {
  const response = await fetch(`${ENDPOINT}/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY.value(),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${detail}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
