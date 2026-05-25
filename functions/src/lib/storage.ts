import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";
import sharp from "sharp";

const SQUARE_SIZE = 1024;
const ZOOM = 1.12; // leicht hineinzoomen -> schneidet umlaufende Scan-/Papierränder weg

// Schneidet jedes Bild zentriert auf ein identisches Quadrat zu UND zoomt leicht
// hinein (entfernt Ränder), damit echte Gemälde und KI-Bilder nicht am Format/Rand
// unterscheidbar sind. Speichert als WebP.
async function toSquareWebp(buffer: Buffer): Promise<Buffer> {
  const big = Math.round(SQUARE_SIZE * ZOOM);
  const offset = Math.round((big - SQUARE_SIZE) / 2);
  return sharp(buffer)
    .resize(big, big, { fit: "cover", position: "centre" })
    .extract({ left: offset, top: offset, width: SQUARE_SIZE, height: SQUARE_SIZE })
    .webp({ quality: 88 })
    .toBuffer();
}

// Lädt ein (ggf. kurzlebiges) Quell-Bild, normalisiert es auf ein Quadrat und legt
// es dauerhaft in Firebase Storage ab. Gibt eine permanente Download-URL zurück.
// Wird für ECHTE (Met) wie für KI-Bilder (Replicate) verwendet -> beide identisch gerahmt.
export async function persistImageFromUrl(sourceUrl: string): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Bild-Download fehlgeschlagen: ${response.status}`);
  }
  const original = Buffer.from(await response.arrayBuffer());
  const square = await toSquareWebp(original);

  const bucket = getStorage().bucket();
  const file = bucket.file(`challenge-images/${randomUUID()}.webp`);
  const token = randomUUID();
  await file.save(square, {
    resumable: false,
    metadata: { contentType: "image/webp", metadata: { firebaseStorageDownloadTokens: token } },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`;
}
