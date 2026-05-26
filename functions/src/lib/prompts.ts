import { LibraryEntry } from "./library";

export function buildTextPrompt(entry: LibraryEntry): string {
  const original = entry.original.inhalt;
  const lines = original.split("\n").filter((line) => line.trim().length > 0).length;
  const words = original.trim().split(/\s+/).length;
  // Strophen = durch Leerzeile getrennte Blöcke (für die Struktur-Vorgabe bei Gedichten).
  const stanzas = original.split(/\n\s*\n+/).filter((block) => block.trim().length > 0).length;
  const isPoem = entry.kategorie === "gedicht";
  const form = isPoem ? "ein Gedicht" : "eine kurze Prosapassage";
  const lengthHint = isPoem
    ? `Gleiche Länge wie das Original: etwa ${lines} Verse bzw. ~${words} Wörter.`
    : `Gleiche Länge wie das Original: etwa ${words} Wörter.`;
  const structureHint =
    isPoem && stanzas > 1
      ? `Schreibe jeden Vers in eine eigene Zeile und gliedere das Gedicht in ${stanzas} Strophen – trenne die Strophen durch je eine LEERZEILE (kein Fließtext, keine durchlaufenden Verse).`
      : isPoem
        ? "Schreibe jeden Vers in eine eigene Zeile."
        : "";
  return [
    `Schreibe ${form} zum Thema „${entry.thema}" im unverkennbaren Stil von ${entry.kuenstler}.`,
    "Gleiche Epoche, gleiche Sprache, typische Bildsprache und Form.",
    `WICHTIG – ${lengthHint} Nicht wesentlich länger oder kürzer.`,
    structureHint,
    "Erfinde einen EIGENEN, neuen Text – zitiere oder reproduziere KEIN existierendes Werk",
    "wörtlich (auch nicht den bekannten Originaltext zu diesem Thema/Autor).",
    "Antworte ausschließlich mit dem Text – ohne Titel, ohne Anführungszeichen,",
    "ohne Erklärung und ohne jeden Hinweis darauf, dass du eine KI bist.",
  ]
    .filter((line) => line.length > 0)
    .join(" ");
}

export function buildImagePrompt(entry: LibraryEntry): string {
  return [
    `Ein Gemälde im Stil von ${entry.kuenstler}.`,
    `Motiv: ${entry.thema}.`,
    "Komposition, Farbpalette und die für diese:n Künstler:in typische Technik/Materialwahl",
    "(kein bestimmtes Medium erzwingen – Öl, Tempera, Pastell o. Ä. je nach Stil).",
    "Es soll wie eine MUSEUMSDIGITALISIERUNG / fotografische Reproduktion eines echten, gealterten",
    "Originals dieser Zeit wirken – konkret wie ein Scan aus Wikimedia Commons oder dem Met Open Access:",
    "deutlich sichtbare Craquelé-Risse im Farbauftrag, vergilbter Firnis mit warmem Gelbstich,",
    "abgegriffene Leinwand-Textur bzw. Holztafelmaserung, taktil sichtbare Pinselführung mit Impasto-Relief,",
    "gedämpfte/abgetönte, eher matte, KEINESFALLS übersättigte Farben, dünner Patina- und Staubfilm,",
    "winzige Restaurierungs- und Abrieb-Spuren, dezent ungleichmäßige Museumsbeleuchtung, leichte Foto-Vignettierung,",
    "mildes Foto-/Scan-Korn, minimaler Schärfeverlust durch Reproduktionsfotografie.",
    "AUF KEINEN FALL: digital-glatte Oberflächen, KI-typische Hyperschärfe, gleichmäßiger Studio-Look,",
    "übersättigte oder neonartige Farben, fehlerfreie perfekte Details, modernes Digital-Painting-Aussehen,",
    "Hochglanz-Render, makellose Pixel. Es soll wirken wie ein 100+ Jahre altes Werk, abfotografiert im Museum.",
    "Bildfüllend, kein Rahmen, kein Passepartout, kein Text, keine Signatur, kein Wasserzeichen.",
  ].join(" ");
}
