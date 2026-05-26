import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";
import sharp from "sharp";

const SQUARE_SIZE = 1024;
const ZOOM = 1.12; // leicht hineinzoomen -> schneidet umlaufende Scan-/Papierränder weg

export interface PersistOptions {
  // KI-Bilder wirken oft zu sauber/scharf/digital. Mit `aged: true` wird das Bild
  // leicht weichgezeichnet, entsättigt und warm getönt + niedrigere WebP-Qualität ->
  // simuliert museale Foto-Reproduktion (vergilbter Firnis, Foto-Korn, Scan-Charakter).
  // NUR auf KI-Fälschungen anwenden, nie auf echte Originale.
  aged?: boolean;
}

async function toSquareWebp(buffer: Buffer, { aged = false }: PersistOptions = {}): Promise<Buffer> {
  const big = Math.round(SQUARE_SIZE * ZOOM);
  const offset = Math.round((big - SQUARE_SIZE) / 2);
  let pipeline = sharp(buffer)
    .resize(big, big, { fit: "cover", position: "centre" })
    .extract({ left: offset, top: offset, width: SQUARE_SIZE, height: SQUARE_SIZE });
  if (aged) {
    pipeline = pipeline
      .blur(0.6) // kappt KI-Hyperschärfe
      .modulate({ saturation: 0.85 }) // gedämpfte Museumsfarben
      .tint({ r: 255, g: 246, b: 228 }) // warmer Firnis-Stich
      .gamma(1.05); // sanfte Tonwert-Kompression
  }
  return pipeline.webp({ quality: aged ? 78 : 88 }).toBuffer();
}

// Lädt ein (ggf. kurzlebiges) Quell-Bild, normalisiert es auf ein Quadrat und legt
// es dauerhaft in Firebase Storage ab. Gibt eine permanente Download-URL zurück.
// Wird für ECHTE (Met) wie für KI-Bilder (Replicate) verwendet -> beide identisch gerahmt.
// Mit `{aged: true}` werden KI-Bilder zusätzlich gealtert (siehe PersistOptions).
export async function persistImageFromUrl(sourceUrl: string, options: PersistOptions = {}): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Bild-Download fehlgeschlagen: ${response.status}`);
  }
  const original = Buffer.from(await response.arrayBuffer());
  const square = await toSquareWebp(original, options);

  const bucket = getStorage().bucket();
  const file = bucket.file(`challenge-images/${randomUUID()}.webp`);
  const token = randomUUID();
  await file.save(square, {
    resumable: false,
    metadata: { contentType: "image/webp", metadata: { firebaseStorageDownloadTokens: token } },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
}
