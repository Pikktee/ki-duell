import { getFirestore } from "firebase-admin/firestore";
import { LibraryEntry, LIBRARY } from "./library";

const COLLECTION = "library";

export async function listLibrary(): Promise<LibraryEntry[]> {
  const snap = await getFirestore().collection(COLLECTION).get();
  return snap.docs.map((doc) => doc.data() as LibraryEntry);
}

export async function upsertLibraryEntry(entry: LibraryEntry): Promise<void> {
  await getFirestore().collection(COLLECTION).doc(entry.id).set(entry);
}

export async function deleteLibraryEntry(id: string): Promise<void> {
  await getFirestore().collection(COLLECTION).doc(id).delete();
}

// Befüllt die Firestore-Bibliothek aus dem Seed (library.ts). Standardmäßig nur,
// wenn sie noch leer ist (idempotent); mit force=true wird der Seed neu geschrieben.
export async function seedLibrary(force = false): Promise<number> {
  const db = getFirestore();
  const col = db.collection(COLLECTION);
  if (!force) {
    const existing = await col.limit(1).get();
    if (!existing.empty) return 0;
  }
  let batch = db.batch();
  let count = 0;
  for (const entry of LIBRARY) {
    batch.set(col.doc(entry.id), entry);
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  return count;
}
