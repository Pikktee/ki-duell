# CLAUDE.md

## Was ist KI-Duell - ECHT ODER KI?

Backend-**Proxy** für das Spiel **„Echt oder KI? – Das Stil-Duell"**: Pro Runde sieht
der Spieler ein gematchtes Paar (gleiche:r Künstler:in, gleiches Thema, gleicher Stil) –
einmal das **echte** gemeinfreie Werk eines Menschen, einmal eine **KI-Fälschung im Stil
dieser Person**. Geraten wird: Welches ist die KI? Kernbotschaft: „KI kann jeden Stil
imitieren." Schwierigkeit ergibt sich aus der Modellstärke (leicht → schwer).

**Spielmodell:** Es gibt **ausschließlich Tages-Challenges**. Der Spieler **wählt eine
Stufe** (leicht/mittel/schwer); pro Tag und Stufe gibt es eine eigene, für alle identische
Challenge (6 Runden: 3 Text + 3 Bild, gemischt). Ranglisten: **3 Tages-Leaderboards** (pro Stufe, ohne Login spielbar
via anonymer Auth) + **1 kombiniertes Global-Ranking** (Gesamt-Meisterschaft, kumulativ,
schwere Stufen zählen mehr, nur für eingeloggte Nutzer). Kein Practice-Modus.

Dieser Ordner ist **nur das Backend**. Die Spiel-UI (Frontend, z. B. in Google AI Studio
gebaut) ist ein separates Projekt und ruft ausschließlich die hier definierten
Firebase Callable Functions auf.

## Stack

- **Firebase Cloud Functions (2. Gen), TypeScript** – Proxy-Endpunkte + Cron.
- **OpenRouter** – Text-Fälschungen (viele Modelle, ein Key).
- **Replicate** – Bild-Fälschungen (verschiedene Modell-Generationen je Stufe).
- **Firebase Auth + Firestore** – anonyme Auth (ohne Login) + Google-Login; Leaderboards.

## Commands

```bash
cd functions && npm install      # Abhängigkeiten
cd functions && npm run build    # tsc – Typen prüfen / kompilieren nach lib/
cd functions && npm run serve    # Emulator (functions + firestore)
cd functions && npm run admin    # lokale Admin-Seite auf http://localhost:5055 (../admin)
firebase deploy --only functions,firestore:rules   # Deploy

# Secrets (Secret Manager – niemals im Code)
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set REPLICATE_API_KEY
firebase functions:secrets:set ADMIN_TOKEN          # frei wählbares Geheimnis für den Admin-Endpoint
firebase functions:secrets:set ELEVENLABS_API_KEY   # für das Vorlesen der Gedichte (TTS)
# Voraussetzung fürs TTS-Caching: Firebase Storage im Projekt aktivieren (Default-Bucket).

# Challenge manuell erzeugen (z. B. heute, alle Stufen):
curl -X POST "https://us-central1-ki-duell.cloudfunctions.net/adminGenerateChallenge" \
     -H "x-admin-token: <ADMIN_TOKEN>"
# optional: ?difficulty=schwer und/oder ?date=YYYY-MM-DD
```

Vor jedem Deploy/Merge: `npm run build` muss fehlerfrei durchlaufen.

## Bibliothek live bearbeiten (Firestore, ohne Re-Seed)

Die `library`-Collection lässt sich zur Laufzeit über die token-geschützten Admin-HTTP-
Endpunkte lesen/schreiben – so editiert man Werke direkt in den **Live-Daten**
(≠ `lib/library.ts`, das ist nur der Seed). Das `ADMIN_TOKEN` kommt aus dem Secret
Manager (Firebase-CLI muss eingeloggt sein):

```bash
TOKEN=$(firebase functions:secrets:access ADMIN_TOKEN --project ki-duell | tr -d '\n')
BASE=https://us-central1-ki-duell.cloudfunctions.net
ENC=$(python3 -c "import urllib.parse,os;print(urllib.parse.quote(os.environ['T']))" )  # T=$TOKEN
# Lesen:
curl -s --get "$BASE/adminListLibrary" --data-urlencode "token=$TOKEN"
# Anlegen/Ändern (Upsert per id; Felder flach; akzeptiert JSON ODER form-urlencoded):
curl -s -X POST "$BASE/adminSaveLibraryEntry?token=$ENC" \
  --data-urlencode kategorie=gedicht --data-urlencode kuenstler=... \
  --data-urlencode thema=... --data-urlencode bekanntheit=niedrig \
  --data-urlencode inhalt=... --data-urlencode quelle=... --data-urlencode id=...
# Löschen:
curl -s -X POST "$BASE/adminDeleteLibraryEntry?token=$ENC&id=<id>"
```

- Felder flach: `id, kategorie, kuenstler, thema, bekanntheit, inhalt, quelle`
  (`inhalt` alternativ als `original.inhalt`). Gemälde: `inhalt` = öffentliche
  http(s)-Bild-URL, echtes Public-Domain-Werk (Authentizität!).
- Token immer **URL-enkodieren**; der Body akzeptiert **JSON und form-urlencoded**
  (Helper `parseBody` in `admin.ts`).
- Live-Änderungen wirken **nicht rückwirkend** auf bereits gecachte Tages-Challenges
  → betroffene Tage/Stufen neu generieren (`adminGenerateChallenge`).

## Architektur (functions/src/)

- **`index.ts`** – `initializeApp()` + Re-Export aller Functions.
- **`config/tiers.ts`** – `TIER_MODELS`: Mapping Stufe → Modell-Listen (Quelle der Wahrheit
  für Schwierigkeit). `pickModel`, `isDifficulty`. Außerdem `MODEL_INFO`/`TIER_INFO` +
  `tiersOverview()` (Modell-Metadaten/Beschreibungen für die Stufen-Anzeige im Spiel).
- **`meta.ts`** – `getTiers` (Callable, kein Login): liefert pro Stufe die verwendeten Text-/
  Bildmodelle samt lehrreicher Beschreibung (für die Stufen-Auswahl + Lerneffekt).
- **`speech.ts`** – `synthesizeSpeech` (Callable, Login): liest Text per ElevenLabs vor,
  cacht das MP3 in Firebase Storage (`tts/{hash}.mp3`), liefert eine Download-Token-URL.
- **`providers/openrouter.ts`** – Text-Generierung. Secret `OPENROUTER_API_KEY`.
- **`providers/replicate.ts`** – Bild-Generierung (`Prefer: wait` + Poll-Fallback). Secret `REPLICATE_API_KEY`.
- **`providers/elevenlabs.ts`** – Sprachsynthese (TTS, `eleven_multilingual_v2`). Secret `ELEVENLABS_API_KEY`, `VOICE_ID` konfigurierbar.
- **`lib/library.ts`** – `LIBRARY` ist nur noch der **Seed** (Erstbefüllung) + Typen + `isPlaceholderImage`.
- **`lib/libraryStore.ts`** – Firestore-Bibliothek (`library`-Collection): `listLibrary`, `upsertLibraryEntry`, `deleteLibraryEntry`, `seedLibrary`. **Die App liest/schreibt die Bibliothek zur Laufzeit hier**, nicht aus `library.ts`.
- **`lib/prompts.ts`** – Stil-Imitations-Prompts (Text/Bild).
- **`lib/scoring.ts`** – `pointsFor(difficulty)`: Punkte je Stufe (leicht/mittel/schwer = 100/200/300).
- **`lib/storage.ts`** – `persistImageFromUrl`: lädt das KI-Bild herunter und speichert es dauerhaft in Firebase Storage (`challenge-images/`). Replicate-URLs verfallen nach ~1 h, daher Pflicht.
- **`util/random.ts`** – deterministischer PRNG + `shuffle` (für die reproduzierbare Tages-Challenge).
- **`dailyChallenge.ts`** – `getDailyChallenge` (Callable, erwartet `difficulty`, **nur Cache**: liefert `available:false`, wenn nichts da ist – KEINE Lazy-Generierung) + `dailyChallenge` (Cron 00:00 Europe/Berlin, erzeugt alle 3 Stufen) + Helfer `ensureChallenge`/`getChallenge`/`regenerateChallenge`.
- **`admin.ts`** – HTTP-Endpunkte, Token-geschützt via Secret `ADMIN_TOKEN` (CORS an):
  Challenges: `adminGenerateChallenge`, `adminGetChallenges`, `adminGetChallengeRange` (Mehrtages-Übersicht),
  `adminGetChallengeDetail` (volle Challenge inkl. Lösung/Modell), `adminRerollRound` (einzelne Runde neu).
  Bibliothek: `adminListLibrary`, `adminSaveLibraryEntry`, `adminDeleteLibraryEntry`, `adminSeedLibrary`.
  Bedient die lokale Admin-Seite `admin/index.html`. Generierung passiert NUR hier + im Cron.
- **`submitScore.ts`** – `startDailyRun` (Login): setzt einmalig den Start-Zeitstempel (`runStarts`) für die Zeitmessung. `submitDailyScore`: serverseitige Auswertung (liest Challenge nur aus Cache), ein Versuch pro Tag/Stufe, berechnet `durationMs` serverseitig (jetzt − Start), schreibt Tages-Score + (bei Login) Global-Total inkl. `totalDurationMs`. `getMyDailyStatus` (Login): welche Stufen der Nutzer heute schon gespielt hat (für die Menü-Sperre).

## Zentrale Konventionen & Entscheidungen

- **Authentizität (wichtigste Regel):** Die `original`-Inhalte müssen **echte, gemeinfreie
  Werke von Menschen** sein – **niemals KI-generiert**. Sonst verliert das Spiel seinen Sinn.
  Nur die Fälschung wird zur Laufzeit erzeugt.
- **Bibliothek in Firestore:** Die Bibliothek liegt zur Laufzeit in der `library`-Collection
  (über Admin-UI editierbar). `lib/library.ts` ist nur der **Seed**. Nach dem ersten Deploy
  einmalig befüllen: Admin-UI „Seed laden" bzw. `adminSeedLibrary` (idempotent, nur falls leer).
  Achtung: Live-Änderungen leben in der DB, nicht im Git-Code.
- **Schwierigkeit ist datengetrieben:** Modelle ausschließlich in `config/tiers.ts` pflegen.
  Jede Stufe ist eine **Liste** – weitere Modelle einfach ergänzen, der Proxy wählt pro Runde eines.
- **Sicherheit:** API-Keys nur via Secret Manager (kein Key im Frontend). `dailyChallenges`
  sind client-unlesbar (enthalten die Lösung); `dailyScores`/`globalScores` sind für alle
  lesbar (Frontend liest Ranglisten direkt aus Firestore), aber nur über Functions schreibbar
  (siehe `firestore.rules`).
- **Lösung & Werk-Infos bleiben serverseitig bis zur Auflösung:** `getDailyChallenge`
  liefert während des Spiels weder `fakeId`/`model` noch `kuenstler`/`thema`/`quelle`
  (kein Googeln). All das kommt erst als Antwort von `submitDailyScore` (`reveal`) –
  das ist der Lernmoment.
- **Score-Integrität:** Score wird serverseitig aus den Antworten berechnet (nicht vom Client
  übernommen); ein Versuch pro Tag/Stufe (Doc-ID `date_difficulty_uid` in `dailyScores`).
  Global-Total nur für nicht-anonyme Nutzer (`token.firebase.sign_in_provider !== "anonymous"`).
- **Zeitmessung serverseitig:** `startDailyRun` setzt den Start, `submitDailyScore` rechnet
  `durationMs`. Ranking = **Punkte primär, Zeit als Tiebreaker** (`score desc, durationMs asc`;
  global `totalScore desc, totalDurationMs asc`) – siehe `firestore.indexes.json`.
- **Start verbraucht die Challenge:** `startDailyRun` schreibt `runStarts` und markiert die
  Stufe als verbraucht. Abbrechen/Schließen/Reload ohne Abschluss → bleibt gesperrt (kein
  Re-Try). `getMyDailyStatus` sperrt **beendete** (`dailyScores`) UND **gestartete**
  (`runStarts`) Stufen: `null` = spielbar, `{completed:true,…}` = beendet, `{completed:false,
  abandoned:true}` = gestartet/abgebrochen. Godmode ausgenommen (immer `null`).
- **Godmode (Test-Cheat):** Spielername "Godmode" (`isGodmode`) darf Challenges beliebig oft
  spielen; solche Läufe werden NICHT gespeichert (kein Tages-Lock, keine Ranglisten-Einträge,
  `countsForGlobal:false`). Offene Hintertür per Name – Scores können aber nicht „farmen",
  da nichts persistiert wird.
- **Tages-Challenge ist deterministisch & gecacht:** Auswahl per `seededRandom(date_difficulty)`
  – eigener Seed je Stufe (andere Werke pro Stufe), einmal in Firestore gespeichert → alle
  Spieler einer Stufe sehen dasselbe, spart API-Kosten.
- **Bild-Platzhalter:** Einträge mit `TODO_GEMEINFREIE_BILD_URL_EINTRAGEN` werden aus der
  Tages-Challenge automatisch ausgelassen, bis eine echte URL eingetragen ist.
- **KI-Bilder dauerhaft sichern:** Replicate-Ausgabe-URLs verfallen nach ~1 h. Beim Erzeugen
  einer Challenge wird das KI-Bild daher sofort nach Firebase Storage kopiert (`challenge-images/`)
  und die permanente URL gespeichert. Setzt aktiviertes Firebase Storage voraus.

## Code-Stil

- Volle Type-Hints, `strict` ist an. `Any` vermeiden.
- Thin Functions: Eingabe validieren → Service/Provider rufen → Antwort. Bei Fehlern
  `HttpsError` mit klarem `detail`.
- Beschreibende Namen; Kommentare erklären **warum**, nicht was die nächste Zeile tut.
- Keine Keys, Tokens oder Geheimnisse committen.
