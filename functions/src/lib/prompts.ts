import { LibraryEntry } from "./library";

export function buildTextPrompt(entry: LibraryEntry): string {
  const original = entry.original.inhalt;
  const lines = original.split("\n").filter((line) => line.trim().length > 0).length;
  const words = original.trim().split(/\s+/).length;
  const form = entry.kategorie === "gedicht" ? "ein Gedicht" : "eine kurze Prosapassage";
  const lengthHint =
    entry.kategorie === "gedicht"
      ? `Gleiche Länge wie das Original: etwa ${lines} Verse bzw. ~${words} Wörter.`
      : `Gleiche Länge wie das Original: etwa ${words} Wörter.`;
  return [
    `Schreibe ${form} zum Thema „${entry.thema}" im unverkennbaren Stil von ${entry.kuenstler}.`,
    "Gleiche Epoche, gleiche Sprache, typische Bildsprache und Form.",
    `WICHTIG – ${lengthHint} Nicht wesentlich länger oder kürzer.`,
    "Erfinde einen EIGENEN, neuen Text – zitiere oder reproduziere KEIN existierendes Werk",
    "wörtlich (auch nicht den bekannten Originaltext zu diesem Thema/Autor).",
    "Antworte ausschließlich mit dem Text – ohne Titel, ohne Anführungszeichen,",
    "ohne Erklärung und ohne jeden Hinweis darauf, dass du eine KI bist.",
  ].join(" ");
}

export function buildImagePrompt(entry: LibraryEntry): string {
  return [
    `Ein Gemälde im Stil von ${entry.kuenstler}.`,
    `Motiv: ${entry.thema}.`,
    "Komposition, Farbpalette und die für diese:n Künstler:in typische Technik/Materialwahl",
    "(kein bestimmtes Medium erzwingen – Öl, Tempera, Pastell o. Ä. je nach Stil).",
    "Es soll wie eine FOTOGRAFISCHE REPRODUKTION eines echten, gealterten Originals dieser",
    "Zeit und Technik wirken: leicht gealterte Oberfläche, gedämpfte/abgetönte, NICHT übersättigte",
    "Farben, authentische Material- und Oberflächentextur, gleichmäßige Museumsbeleuchtung,",
    "dezentes Korn. Nicht zu sauber, zu bunt oder digital-glatt.",
    "Bildfüllend, kein Rahmen, kein Passepartout, kein Text, keine Signatur, kein Wasserzeichen.",
  ].join(" ");
}
