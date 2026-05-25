// KURATIERTE BIBLIOTHEK – ZENTRALE REGEL:
// Die "original"-Inhalte müssen ECHTE, gemeinfreie Werke von Menschen sein
// (Autor vor >70 Jahren verstorben bzw. Public Domain). Niemals von einer KI
// erzeugen lassen – sonst verliert das Spiel seinen Sinn. Die KI-Fälschung wird
// zur Laufzeit passend zum Eintrag generiert (im Stil des/der Künstler:in).
//
// Quellen zum Erweitern: Project Gutenberg (Text), Wikimedia Commons / Met
// Museum API / Rijksmuseum API (gemeinfreie Gemälde). Für mehr Spielreiz
// bevorzugt WENIGER bekannte Werke ergänzen (bekanntheit: "mittel"/"niedrig").
//
// Gemälde: Met-Museum-Open-Access (CC0), URLs zur Laufzeit geladen.
// Texte: kuratiert; der genaue Wortlaut sollte gegen eine vertrauenswürdige
// Quelle gegengeprüft werden, bevor öffentlich gespielt wird.

export type Category = "gedicht" | "prosa" | "gemaelde";
export type Fame = "hoch" | "mittel" | "niedrig";
export type OriginalType = "text" | "bild";

export interface LibraryEntry {
  id: string;
  kategorie: Category;
  kuenstler: string;
  thema: string;
  bekanntheit: Fame;
  original: {
    typ: OriginalType;
    inhalt: string; // Text-Inhalt ODER Bild-URL (bei typ === "bild")
    quelle: string;
  };
}

const BILD_PLATZHALTER = "TODO_GEMEINFREIE_BILD_URL_EINTRAGEN";

export const LIBRARY: LibraryEntry[] = [
  {
    id: "goethe-nachtlied",
    kategorie: "gedicht",
    kuenstler: "Johann Wolfgang von Goethe",
    thema: "Abendliche Ruhe in der Natur",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Über allen Gipfeln\nIst Ruh,\nIn allen Wipfeln\nSpürest du\nKaum einen Hauch;\nDie Vögelein schweigen im Walde.\nWarte nur, balde\nRuhest du auch.",
      quelle: "Wandrers Nachtlied (Ein Gleiches), gemeinfrei",
    },
  },
  {
    id: "goethe-heidenroeslein",
    kategorie: "gedicht",
    kuenstler: "Johann Wolfgang von Goethe",
    thema: "Ein Knabe und eine Rose auf der Heide",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Sah ein Knab ein Röslein stehn,\nRöslein auf der Heiden,\nWar so jung und morgenschön,\nLief er schnell, es nah zu sehn,\nSah's mit vielen Freuden.\nRöslein, Röslein, Röslein rot,\nRöslein auf der Heiden.\n\nKnabe sprach: Ich breche dich,\nRöslein auf der Heiden!\nRöslein sprach: Ich steche dich,\nDass du ewig denkst an mich,\nUnd ich will's nicht leiden.\nRöslein, Röslein, Röslein rot,\nRöslein auf der Heiden.\n\nUnd der wilde Knabe brach\n's Röslein auf der Heiden;\nRöslein wehrte sich und stach,\nHalf ihm doch kein Weh und Ach,\nMusst es eben leiden.\nRöslein, Röslein, Röslein rot,\nRöslein auf der Heiden.",
      quelle: "Heidenröslein, gemeinfrei",
    },
  },
  {
    id: "goethe-gefunden",
    kategorie: "gedicht",
    kuenstler: "Johann Wolfgang von Goethe",
    thema: "Eine Blume ausgraben statt pflücken",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Ich ging im Walde\nSo für mich hin,\nUnd nichts zu suchen,\nDas war mein Sinn.\n\nIm Schatten sah ich\nEin Blümchen stehn,\nWie Sterne leuchtend,\nWie Äuglein schön.\n\nIch wollt es brechen,\nDa sagt' es fein:\nSoll ich zum Welken\nGebrochen sein?\n\nIch grub's mit allen\nDen Würzlein aus,\nZum Garten trug ich's\nAm hübschen Haus.\n\nUnd pflanzt es wieder\nAm stillen Ort;\nNun zweigt es immer\nUnd blüht so fort.",
      quelle: "Gefunden, gemeinfrei",
    },
  },
  {
    id: "heine-fichtenbaum",
    kategorie: "gedicht",
    kuenstler: "Heinrich Heine",
    thema: "Sehnsucht und Einsamkeit",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Ein Fichtenbaum steht einsam\nIm Norden auf kahler Höh.\nIhn schläfert; mit weißer Decke\nUmhüllen ihn Eis und Schnee.\n\nEr träumt von einer Palme,\nDie, fern im Morgenland,\nEinsam und schweigend trauert\nAuf brennender Felsenwand.",
      quelle: "Buch der Lieder, gemeinfrei",
    },
  },
  {
    id: "heine-blume",
    kategorie: "gedicht",
    kuenstler: "Heinrich Heine",
    thema: "Zärtliche Betrachtung eines geliebten Menschen",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Du bist wie eine Blume,\nso hold und schön und rein;\nich schau dich an, und Wehmut\nschleicht mir ins Herz hinein.\n\nMir ist, als ob ich die Hände\naufs Haupt dir legen sollt,\nbetend, dass Gott dich erhalte\nso rein und schön und hold.",
      quelle: "Buch der Lieder, gemeinfrei",
    },
  },
  {
    id: "heine-mai",
    kategorie: "gedicht",
    kuenstler: "Heinrich Heine",
    thema: "Erwachende Liebe im Frühling",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Im wunderschönen Monat Mai,\nAls alle Knospen sprangen,\nDa ist in meinem Herzen\nDie Liebe aufgegangen.\n\nIm wunderschönen Monat Mai,\nAls alle Vögel sangen,\nDa hab ich ihr gestanden\nMein Sehnen und Verlangen.",
      quelle: "Buch der Lieder, gemeinfrei",
    },
  },
  {
    id: "heine-leise",
    kategorie: "gedicht",
    kuenstler: "Heinrich Heine",
    thema: "Ein Frühlingsgruß",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Leise zieht durch mein Gemüt\nLiebliches Geläute.\nKlinge, kleines Frühlingslied,\nKling hinaus ins Weite.\n\nKling hinaus, bis an das Haus,\nWo die Blumen sprießen.\nWenn du eine Rose schaust,\nSag, ich lass sie grüßen.",
      quelle: "Neue Gedichte, gemeinfrei",
    },
  },
  {
    id: "eichendorff-mondnacht",
    kategorie: "gedicht",
    kuenstler: "Joseph von Eichendorff",
    thema: "Eine stille, sternklare Nacht",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Es war, als hätt der Himmel\nDie Erde still geküsst,\nDass sie im Blütenschimmer\nVon ihm nun träumen müsst.\n\nDie Luft ging durch die Felder,\nDie Ähren wogten sacht,\nEs rauschten leis die Wälder,\nSo sternklar war die Nacht.\n\nUnd meine Seele spannte\nWeit ihre Flügel aus,\nFlog durch die stillen Lande,\nAls flöge sie nach Haus.",
      quelle: "Mondnacht, gemeinfrei",
    },
  },
  {
    id: "eichendorff-wuenschelrute",
    kategorie: "gedicht",
    kuenstler: "Joseph von Eichendorff",
    thema: "Das verborgene Lied der Dinge",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Schläft ein Lied in allen Dingen,\nDie da träumen fort und fort,\nUnd die Welt hebt an zu singen,\nTriffst du nur das Zauberwort.",
      quelle: "Wünschelrute, gemeinfrei",
    },
  },
  {
    id: "eichendorff-ringlein",
    kategorie: "gedicht",
    kuenstler: "Joseph von Eichendorff",
    thema: "Verlorene Liebe an der Mühle",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "In einem kühlen Grunde\nDa geht ein Mühlenrad,\nMein Liebste ist verschwunden,\nDie dort gewohnet hat.\n\nSie hat mir Treu versprochen,\nGab mir ein'n Ring dabei,\nSie hat die Treu gebrochen,\nMein Ringlein sprang entzwei.",
      quelle: "Das zerbrochene Ringlein, gemeinfrei",
    },
  },
  {
    id: "uhland-fruehlingsglaube",
    kategorie: "gedicht",
    kuenstler: "Ludwig Uhland",
    thema: "Der Frühling als Hoffnung",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Die linden Lüfte sind erwacht,\nSie säuseln und weben Tag und Nacht,\nSie schaffen an allen Enden.\nO frischer Duft, o neuer Klang!\nNun, armes Herze, sei nicht bang!\nNun muss sich alles, alles wenden.\n\nDie Welt wird schöner mit jedem Tag,\nMan weiß nicht, was noch werden mag,\nDas Blühen will nicht enden.\nEs blüht das fernste, tiefste Tal:\nNun, armes Herz, vergiss der Qual!\nNun muss sich alles, alles wenden.",
      quelle: "Frühlingsglaube, gemeinfrei",
    },
  },
  {
    id: "moerike-er-ists",
    kategorie: "gedicht",
    kuenstler: "Eduard Mörike",
    thema: "Die Ankunft des Frühlings",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Frühling lässt sein blaues Band\nWieder flattern durch die Lüfte;\nSüße, wohlbekannte Düfte\nStreifen ahnungsvoll das Land.\nVeilchen träumen schon,\nWollen balde kommen.\nHorch, von fern ein leiser Harfenton!\nFrühling, ja du bist's!\nDich hab ich vernommen!",
      quelle: "Er ist's, gemeinfrei",
    },
  },
  {
    id: "moerike-septembermorgen",
    kategorie: "gedicht",
    kuenstler: "Eduard Mörike",
    thema: "Ein nebliger Herbstmorgen",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Im Nebel ruhet noch die Welt,\nNoch träumen Wald und Wiesen:\nBald siehst du, wenn der Schleier fällt,\nDen blauen Himmel unverstellt,\nHerbstkräftig die gedämpfte Welt\nIn warmem Golde fließen.",
      quelle: "Septembermorgen, gemeinfrei",
    },
  },
  {
    id: "rilke-herbsttag",
    kategorie: "gedicht",
    kuenstler: "Rainer Maria Rilke",
    thema: "Herbst, Reife und Einsamkeit",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Herr: es ist Zeit. Der Sommer war sehr groß.\nLeg deinen Schatten auf die Sonnenuhren,\nund auf den Fluren lass die Winde los.\n\nBefiehl den letzten Früchten voll zu sein;\ngib ihnen noch zwei südlichere Tage,\ndränge sie zur Vollendung hin und jage\ndie letzte Süße in den schweren Wein.\n\nWer jetzt kein Haus hat, baut sich keines mehr.\nWer jetzt allein ist, wird es lange bleiben,\nwird wachen, lesen, lange Briefe schreiben\nund wird in den Alleen hin und her\nunruhig wandern, wenn die Blätter treiben.",
      quelle: "Herbsttag, gemeinfrei",
    },
  },
  {
    id: "rilke-panther",
    kategorie: "gedicht",
    kuenstler: "Rainer Maria Rilke",
    thema: "Ein Panther hinter Gittern",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Sein Blick ist vom Vorübergehn der Stäbe\nso müd geworden, dass er nichts mehr hält.\nIhm ist, als ob es tausend Stäbe gäbe\nund hinter tausend Stäben keine Welt.\n\nDer weiche Gang geschmeidig starker Schritte,\nder sich im allerkleinsten Kreise dreht,\nist wie ein Tanz von Kraft um eine Mitte,\nin der betäubt ein großer Wille steht.\n\nNur manchmal schiebt der Vorhang der Pupille\nsich lautlos auf. Dann geht ein Bild hinein,\ngeht durch der Glieder angespannte Stille\nund hört im Herzen auf zu sein.",
      quelle: "Der Panther, gemeinfrei",
    },
  },
  {
    id: "hoelderlin-haelfte",
    kategorie: "gedicht",
    kuenstler: "Friedrich Hölderlin",
    thema: "Sommerfülle und winterliche Leere",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Mit gelben Birnen hänget\nUnd voll mit wilden Rosen\nDas Land in den See,\nIhr holden Schwäne,\nUnd trunken von Küssen\nTunkt ihr das Haupt\nIns heilignüchterne Wasser.\n\nWeh mir, wo nehm ich, wenn\nEs Winter ist, die Blumen, und wo\nDen Sonnenschein,\nUnd Schatten der Erde?\nDie Mauern stehn\nSprachlos und kalt, im Winde\nKlirren die Fahnen.",
      quelle: "Hälfte des Lebens, gemeinfrei",
    },
  },
  {
    id: "storm-die-stadt",
    kategorie: "gedicht",
    kuenstler: "Theodor Storm",
    thema: "Eine graue Stadt am Meer",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Am grauen Strand, am grauen Meer\nUnd seitab liegt die Stadt;\nDer Nebel drückt die Dächer schwer,\nUnd durch die Stille braust das Meer\nEintönig um die Stadt.\n\nEs rauscht kein Wald, es schlägt im Mai\nKein Vogel ohn Unterlass;\nDie Wandergans mit hartem Schrei\nNur fliegt in Herbstesnacht vorbei,\nAm Strande weht das Gras.\n\nDoch hängt mein ganzes Herz an dir,\nDu graue Stadt am Meer;\nDer Jugend Zauber für und für\nRuht lächelnd doch auf dir, auf dir,\nDu graue Stadt am Meer.",
      quelle: "Die Stadt, gemeinfrei",
    },
  },
  {
    id: "storm-nachtigall",
    kategorie: "gedicht",
    kuenstler: "Theodor Storm",
    thema: "Die Nachtigall und die erwachende Liebe",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Das macht, es hat die Nachtigall\nDie ganze Nacht gesungen;\nDa sind von ihrem süßen Schall,\nDa sind in Hall und Widerhall\nDie Rosen aufgesprungen.\n\nSie war doch sonst ein wildes Blut,\nNun geht sie tief in Sinnen,\nTrägt in der Hand den Sommerhut\nUnd duldet still der Sonne Glut\nUnd weiß nicht, was beginnen.\n\nDas macht, es hat die Nachtigall\nDie ganze Nacht gesungen;\nDa sind von ihrem süßen Schall,\nDa sind in Hall und Widerhall\nDie Rosen aufgesprungen.",
      quelle: "Die Nachtigall, gemeinfrei",
    },
  },
  {
    id: "meyer-brunnen",
    kategorie: "gedicht",
    kuenstler: "Conrad Ferdinand Meyer",
    thema: "Ein römischer Springbrunnen",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Aufsteigt der Strahl und fallend gießt\nEr voll der Marmorschale Rund,\nDie, sich verschleiernd, überfließt\nIn einer zweiten Schale Grund;\nDie zweite gibt, sie wird zu reich,\nDer dritten wallend ihre Flut,\nUnd jede nimmt und gibt zugleich\nUnd strömt und ruht.",
      quelle: "Der römische Brunnen, gemeinfrei",
    },
  },
  {
    id: "lenau-bitte",
    kategorie: "gedicht",
    kuenstler: "Nikolaus Lenau",
    thema: "Bitte an ein dunkles Auge",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Weil auf mir, du dunkles Auge,\nÜbe deine ganze Macht,\nErnste, milde, träumerische,\nUnergründlich süße Nacht!\n\nNimm mit deinem Zauberdunkel\nDiese Welt von hinnen mir,\nDass du über meinem Leben\nEinsam schwebest für und für.",
      quelle: "Bitte, gemeinfrei",
    },
  },
  {
    id: "trakl-winterabend",
    kategorie: "gedicht",
    kuenstler: "Georg Trakl",
    thema: "Ein Winterabend und ein Wanderer",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Wenn der Schnee ans Fenster fällt,\nLang die Abendglocke läutet,\nVielen ist der Tisch bereitet\nUnd das Haus ist wohlbestellt.\n\nMancher auf der Wanderschaft\nKommt ans Tor auf dunklen Pfaden.\nGolden blüht der Baum der Gnaden\nAus der Erde kühlem Saft.\n\nWanderer tritt still herein;\nSchmerz versteinerte die Schwelle.\nDa erglänzt in reiner Helle\nAuf dem Tische Brot und Wein.",
      quelle: "Ein Winterabend, gemeinfrei",
    },
  },
  {
    id: "morgenstern-wiesel",
    kategorie: "gedicht",
    kuenstler: "Christian Morgenstern",
    thema: "Ein Wiesel auf einem Kiesel",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Ein Wiesel\nsaß auf einem Kiesel\ninmitten Bachgeriesel.\n\nWisst ihr,\nweshalb?\n\nDas Mondkalb\nverriet es mir\nim Stillen:\n\nDas raffinier-\nte Tier\ntat's um des Reimes willen.",
      quelle: "Das ästhetische Wiesel, gemeinfrei",
    },
  },
  {
    id: "ringelnatz-ameisen",
    kategorie: "gedicht",
    kuenstler: "Joachim Ringelnatz",
    thema: "Zwei Ameisen auf großer Reise",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "In Hamburg lebten zwei Ameisen,\nDie wollten nach Australien reisen.\nBei Altona auf der Chaussee,\nDa taten ihnen die Beine weh,\nUnd da verzichteten sie weise\nDann auf den letzten Teil der Reise.",
      quelle: "Die Ameisen, gemeinfrei",
    },
  },
  {
    id: "kafka-verwandlung",
    kategorie: "prosa",
    kuenstler: "Franz Kafka",
    thema: "Eine unmögliche Verwandlung am Morgen",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheuren Ungeziefer verwandelt.",
      quelle: "Die Verwandlung, gemeinfrei",
    },
  },
  {
    id: "kafka-process",
    kategorie: "prosa",
    kuenstler: "Franz Kafka",
    thema: "Eine grundlose Verhaftung",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet.",
      quelle: "Der Process, gemeinfrei",
    },
  },
  {
    id: "kleist-kohlhaas",
    kategorie: "prosa",
    kuenstler: "Heinrich von Kleist",
    thema: "Ein rechtschaffener und entsetzlicher Mann",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "An den Ufern der Havel lebte, um die Mitte des sechzehnten Jahrhunderts, ein Rosshändler, namens Michael Kohlhaas, Sohn eines Schulmeisters, einer der rechtschaffensten zugleich und entsetzlichsten Menschen seiner Zeit.",
      quelle: "Michael Kohlhaas, gemeinfrei",
    },
  },
  {
    id: "buechner-lenz",
    kategorie: "prosa",
    kuenstler: "Georg Büchner",
    thema: "Ein Gang durchs winterliche Gebirge",
    bekanntheit: "niedrig",
    original: {
      typ: "text",
      inhalt: "Den 20. Jänner ging Lenz durchs Gebirg. Die Gipfel und hohen Bergflächen im Schnee, die Täler hinunter graues Gestein, grüne Flächen, Felsen und Tannen.",
      quelle: "Lenz, gemeinfrei",
    },
  },
  {
    id: "grimm-haensel",
    kategorie: "prosa",
    kuenstler: "Brüder Grimm",
    thema: "Eine arme Familie am Walde",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "Vor einem großen Walde wohnte ein armer Holzhacker mit seiner Frau und seinen zwei Kindern; das Bübchen hieß Hänsel und das Mädchen Gretel.",
      quelle: "Hänsel und Gretel, gemeinfrei",
    },
  },
  {
    id: "grimm-froschkoenig",
    kategorie: "prosa",
    kuenstler: "Brüder Grimm",
    thema: "Eine Königstochter und ein Frosch",
    bekanntheit: "hoch",
    original: {
      typ: "text",
      inhalt: "In den alten Zeiten, wo das Wünschen noch geholfen hat, lebte ein König, dessen Töchter waren alle schön; aber die jüngste war so schön, dass die Sonne selber, die doch so vieles gesehen hat, sich verwunderte, sooft sie ihr ins Gesicht schien.",
      quelle: "Der Froschkönig, gemeinfrei",
    },
  },
  {
    id: "goethe-werther",
    kategorie: "prosa",
    kuenstler: "Johann Wolfgang von Goethe",
    thema: "Die Freude des Fortgehens",
    bekanntheit: "mittel",
    original: {
      typ: "text",
      inhalt: "Wie froh bin ich, dass ich weg bin! Bester Freund, was ist das Herz des Menschen! Dich zu verlassen, den ich so liebe, von dem ich unzertrennlich war, und froh zu sein!",
      quelle: "Die Leiden des jungen Werthers, gemeinfrei",
    },
  },
  {
    id: "dyck-lucas-van-uffel-died-163",
    kategorie: "gemaelde",
    kuenstler: "Anthony van Dyck",
    thema: "Lucas van Uffel (died 1637)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-27908-001.jpg",
      quelle: "Anthony van Dyck, \"Lucas van Uffel (died 1637)\" (ca. 1622), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "dyck-saint-rosalie-intercedin",
    kategorie: "gemaelde",
    kuenstler: "Anthony van Dyck",
    thema: "Saint Rosalie Interceding for the Plague-stricken of Palermo",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-18296-037.jpg",
      quelle: "Anthony van Dyck, \"Saint Rosalie Interceding for the Plague-stricken of Palermo\" (1624), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "dyck-virgin-and-child-with-sa",
    kategorie: "gemaelde",
    kuenstler: "Anthony van Dyck",
    thema: "Virgin and Child with Saint Catherine of Alexandria",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT5286.jpg",
      quelle: "Anthony van Dyck, \"Virgin and Child with Saint Catherine of Alexandria\" (ca. 1630), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "pissarro-haystacks-morning-eragny",
    kategorie: "gemaelde",
    kuenstler: "Camille Pissarro",
    thema: "Haystacks, Morning, Eragny",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-20613-001.jpg",
      quelle: "Camille Pissarro, \"Haystacks, Morning, Eragny\" (1899), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "pissarro-the-harvest-pontoise-la",
    kategorie: "gemaelde",
    kuenstler: "Camille Pissarro",
    thema: "The Harvest, Pontoise (La Récolte, Pontoise)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DP-34499-001.jpg",
      quelle: "Camille Pissarro, \"The Harvest, Pontoise (La Récolte, Pontoise)\" (1881), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "pissarro-the-boulevard-montmartre",
    kategorie: "gemaelde",
    kuenstler: "Camille Pissarro",
    thema: "The Boulevard Montmartre on a Winter Morning",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-21959-001.jpg",
      quelle: "Camille Pissarro, \"The Boulevard Montmartre on a Winter Morning\" (1897), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "degas-the-dance-class",
    kategorie: "gemaelde",
    kuenstler: "Edgar Degas",
    thema: "The Dance Class",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-20101-001.jpg",
      quelle: "Edgar Degas, \"The Dance Class\" (1874), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "degas-the-collector-of-prints",
    kategorie: "gemaelde",
    kuenstler: "Edgar Degas",
    thema: "The Collector of Prints",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-25461-001.jpg",
      quelle: "Edgar Degas, \"The Collector of Prints\" (1866), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "degas-a-woman-seated-beside-a",
    kategorie: "gemaelde",
    kuenstler: "Edgar Degas",
    thema: "A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-25460-001.jpg",
      quelle: "Edgar Degas, \"A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?)\" (1865), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "manet-the-spanish-singer",
    kategorie: "gemaelde",
    kuenstler: "Edouard Manet",
    thema: "The Spanish Singer",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/dp130799.jpg",
      quelle: "Edouard Manet, \"The Spanish Singer\" (1860), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "manet-young-lady-in-1866",
    kategorie: "gemaelde",
    kuenstler: "Edouard Manet",
    thema: "Young Lady in 1866",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP273977.jpg",
      quelle: "Edouard Manet, \"Young Lady in 1866\" (1866), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "manet-the-dead-christ-with-ang",
    kategorie: "gemaelde",
    kuenstler: "Edouard Manet",
    thema: "The Dead Christ with Angels",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-17679-001.jpg",
      quelle: "Edouard Manet, \"The Dead Christ with Angels\" (1864), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "greco-the-adoration-of-the-she",
    kategorie: "gemaelde",
    kuenstler: "El Greco",
    thema: "The Adoration of the Shepherds",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP123919.jpg",
      quelle: "El Greco, \"The Adoration of the Shepherds\" (ca. 1605–10), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "greco-view-of-toledo",
    kategorie: "gemaelde",
    kuenstler: "El Greco",
    thema: "View of Toledo",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP349564.jpg",
      quelle: "El Greco, \"View of Toledo\" (ca. 1599–1600), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "greco-christ-carrying-the-cros",
    kategorie: "gemaelde",
    kuenstler: "El Greco",
    thema: "Christ Carrying the Cross",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DP347226.jpg",
      quelle: "El Greco, \"Christ Carrying the Cross\" (ca. 1577–87), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "delacroix-the-abduction-of-rebecca",
    kategorie: "gemaelde",
    kuenstler: "Eugene Delacroix",
    thema: "The Abduction of Rebecca",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-14344-001.jpg",
      quelle: "Eugene Delacroix, \"The Abduction of Rebecca\" (1846), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "delacroix-basket-of-flowers",
    kategorie: "gemaelde",
    kuenstler: "Eugene Delacroix",
    thema: "Basket of Flowers",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-14347-001.jpg",
      quelle: "Eugene Delacroix, \"Basket of Flowers\" (1848–49), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "delacroix-the-natchez",
    kategorie: "gemaelde",
    kuenstler: "Eugene Delacroix",
    thema: "The Natchez",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-14345-001.jpg",
      quelle: "Eugene Delacroix, \"The Natchez\" (1823–24 and 1835), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "goya-tiburcio-perez-y-cuervo",
    kategorie: "gemaelde",
    kuenstler: "Francisco Goya",
    thema: "Tiburcio Pérez y Cuervo (1785/86–1841), the Architect",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP295718.jpg",
      quelle: "Francisco Goya, \"Tiburcio Pérez y Cuervo (1785/86–1841), the Architect\" (1820), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "goya-jose-costa-y-bonells-die",
    kategorie: "gemaelde",
    kuenstler: "Francisco Goya",
    thema: "José Costa y Bonells (died l870), Called Pepito",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP123853.jpg",
      quelle: "Francisco Goya, \"José Costa y Bonells (died l870), Called Pepito\" (ca. 1810), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "goya-sebastian-martinez-y-per",
    kategorie: "gemaelde",
    kuenstler: "Francisco Goya",
    thema: "Sebastián Martínez y Pérez (1747–1800)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-28009-001.jpg",
      quelle: "Francisco Goya, \"Sebastián Martínez y Pérez (1747–1800)\" (1792), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "hals-young-man-and-woman-in-a",
    kategorie: "gemaelde",
    kuenstler: "Frans Hals",
    thema: "Young Man and Woman in an Inn",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP145899.jpg",
      quelle: "Frans Hals, \"Young Man and Woman in an Inn\" (1623), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "hals-merrymakers-at-shrovetid",
    kategorie: "gemaelde",
    kuenstler: "Frans Hals",
    thema: "Merrymakers at Shrovetide",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP145901.jpg",
      quelle: "Frans Hals, \"Merrymakers at Shrovetide\" (ca. 1616–17), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "hals-portrait-of-a-man",
    kategorie: "gemaelde",
    kuenstler: "Frans Hals",
    thema: "Portrait of a Man",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-44327-001.jpg",
      quelle: "Frans Hals, \"Portrait of a Man\" (early 1650s), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "seurat-circus-sideshow-parade-d",
    kategorie: "gemaelde",
    kuenstler: "Georges Seurat",
    thema: "Circus Sideshow (Parade de cirque)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP375450_cropped.jpg",
      quelle: "Georges Seurat, \"Circus Sideshow (Parade de cirque)\" (1887–88), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "seurat-the-mower",
    kategorie: "gemaelde",
    kuenstler: "Georges Seurat",
    thema: "The Mower",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DP-34423-001.jpg",
      quelle: "Georges Seurat, \"The Mower\" (1881–82), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "seurat-study-for-a-sunday-on-la",
    kategorie: "gemaelde",
    kuenstler: "Georges Seurat",
    thema: "Study for \"A Sunday on La Grande Jatte\"",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP259921.jpg",
      quelle: "Georges Seurat, \"Study for \"A Sunday on La Grande Jatte\"\" (1884), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "corot-sibylle",
    kategorie: "gemaelde",
    kuenstler: "Jean-Baptiste-Camille Corot",
    thema: "Sibylle",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-16592-001.jpg",
      quelle: "Jean-Baptiste-Camille Corot, \"Sibylle\" (ca. 1870), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "corot-hagar-in-the-wilderness",
    kategorie: "gemaelde",
    kuenstler: "Jean-Baptiste-Camille Corot",
    thema: "Hagar in the Wilderness",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT2013.jpg",
      quelle: "Jean-Baptiste-Camille Corot, \"Hagar in the Wilderness\" (1835), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "corot-the-letter",
    kategorie: "gemaelde",
    kuenstler: "Jean-Baptiste-Camille Corot",
    thema: "The Letter",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT2129.jpg",
      quelle: "Jean-Baptiste-Camille Corot, \"The Letter\" (ca. 1865), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "vermeer-young-woman-with-a-water",
    kategorie: "gemaelde",
    kuenstler: "Johannes Vermeer",
    thema: "Young Woman with a Water Pitcher",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP353257.jpg",
      quelle: "Johannes Vermeer, \"Young Woman with a Water Pitcher\" (ca. 1662), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "vermeer-allegory-of-the-catholic",
    kategorie: "gemaelde",
    kuenstler: "Johannes Vermeer",
    thema: "Allegory of the Catholic Faith",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP145924.jpg",
      quelle: "Johannes Vermeer, \"Allegory of the Catholic Faith\" (ca. 1670–72), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "vermeer-a-maid-asleep",
    kategorie: "gemaelde",
    kuenstler: "Johannes Vermeer",
    thema: "A Maid Asleep",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP355525.jpg",
      quelle: "Johannes Vermeer, \"A Maid Asleep\" (ca. 1656–57), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gauguin-ia-orana-maria-hail-mary",
    kategorie: "gemaelde",
    kuenstler: "Paul Gauguin",
    thema: "Ia Orana Maria (Hail Mary)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT1025.jpg",
      quelle: "Paul Gauguin, \"Ia Orana Maria (Hail Mary)\" (1891), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gauguin-the-siesta",
    kategorie: "gemaelde",
    kuenstler: "Paul Gauguin",
    thema: "The Siesta",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT1952.jpg",
      quelle: "Paul Gauguin, \"The Siesta\" (ca. 1892–94), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gauguin-tahitian-women-bathing",
    kategorie: "gemaelde",
    kuenstler: "Paul Gauguin",
    thema: "Tahitian Women Bathing",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DP-34475-001.jpg",
      quelle: "Paul Gauguin, \"Tahitian Women Bathing\" (1892), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "renoir-in-the-meadow",
    kategorie: "gemaelde",
    kuenstler: "Pierre-Auguste Renoir",
    thema: "In the Meadow",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT1398.jpg",
      quelle: "Pierre-Auguste Renoir, \"In the Meadow\" (1888–92), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "renoir-tilla-durieux-ottilie-go",
    kategorie: "gemaelde",
    kuenstler: "Pierre-Auguste Renoir",
    thema: "Tilla Durieux (Ottilie Godeffroy, 1880–1971)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-25036-001.jpg",
      quelle: "Pierre-Auguste Renoir, \"Tilla Durieux (Ottilie Godeffroy, 1880–1971)\" (1914), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "renoir-eugene-murer-hyacinthe-e",
    kategorie: "gemaelde",
    kuenstler: "Pierre-Auguste Renoir",
    thema: "Eugène Murer (Hyacinthe-Eugène Meunier, 1841–1906)",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT1882.jpg",
      quelle: "Pierre-Auguste Renoir, \"Eugène Murer (Hyacinthe-Eugène Meunier, 1841–1906)\" (1877), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "elder-the-harvesters",
    kategorie: "gemaelde",
    kuenstler: "Pieter Bruegel der Ältere",
    thema: "The Harvesters",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP119115.jpg",
      quelle: "Pieter Bruegel der Ältere, \"The Harvesters\" (1565), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "elder-a-woodland-road-with-tra",
    kategorie: "gemaelde",
    kuenstler: "Pieter Bruegel der Ältere",
    thema: "A Woodland Road with Travelers",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-19631-001.jpg",
      quelle: "Pieter Bruegel der Ältere, \"A Woodland Road with Travelers\" (1607), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "elder-the-judgment-of-paris",
    kategorie: "gemaelde",
    kuenstler: "Pieter Bruegel der Ältere",
    thema: "The Judgment of Paris",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP280358.jpg",
      quelle: "Pieter Bruegel der Ältere, \"The Judgment of Paris\" (ca. 1528), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "rijn-man-in-a-turban",
    kategorie: "gemaelde",
    kuenstler: "Rembrandt van Rijn",
    thema: "Man in a Turban",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP146479.jpg",
      quelle: "Rembrandt van Rijn, \"Man in a Turban\" (1632), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "rijn-self-portrait",
    kategorie: "gemaelde",
    kuenstler: "Rembrandt van Rijn",
    thema: "Self-Portrait",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP-16323-001.jpg",
      quelle: "Rembrandt van Rijn, \"Self-Portrait\" (1660), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "rijn-portrait-of-gerard-de-la",
    kategorie: "gemaelde",
    kuenstler: "Rembrandt van Rijn",
    thema: "Portrait of Gerard de Lairesse",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DP121332.jpg",
      quelle: "Rembrandt van Rijn, \"Portrait of Gerard de Lairesse\" (1665–67), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gogh-madame-roulin-and-her-ba",
    kategorie: "gemaelde",
    kuenstler: "Vincent van Gogh",
    thema: "Madame Roulin and Her Baby",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/rl/original/DT3154.jpg",
      quelle: "Vincent van Gogh, \"Madame Roulin and Her Baby\" (1888), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gogh-shoes",
    kategorie: "gemaelde",
    kuenstler: "Vincent van Gogh",
    thema: "Shoes",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DT1947.jpg",
      quelle: "Vincent van Gogh, \"Shoes\" (1888), The Metropolitan Museum of Art (CC0)",
    },
  },
  {
    id: "gogh-irises",
    kategorie: "gemaelde",
    kuenstler: "Vincent van Gogh",
    thema: "Irises",
    bekanntheit: "mittel",
    original: {
      typ: "bild",
      inhalt: "https://images.metmuseum.org/CRDImages/ep/original/DP346474.jpg",
      quelle: "Vincent van Gogh, \"Irises\" (1890), The Metropolitan Museum of Art (CC0)",
    },
  },
];

// LIBRARY ist ab jetzt nur noch der SEED (Erstbefüllung). Zur Laufzeit liest/schreibt
// die App die Bibliothek in Firestore – siehe lib/libraryStore.ts.

export function isPlaceholderImage(entry: LibraryEntry): boolean {
  return entry.original.typ === "bild" && entry.original.inhalt === BILD_PLATZHALTER;
}
