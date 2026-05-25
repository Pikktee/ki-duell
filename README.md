# KI-Duell – Proxy (Firebase Functions)

Backend-Proxy für das Spiel **„Echt oder KI? – Das Stil-Duell"**. Er versteckt die
API-Keys, generiert die KI-Fälschungen, cached die tägliche Challenge und wertet
Scores serverseitig aus. Die Spiel-UI (Frontend) ist ein separates Projekt
(z. B. in Google AI Studio gebaut) und ruft nur diese Functions auf.

## Architektur

- **Spielmodell:** nur **Tages-Challenges**. Spieler wählt eine **Stufe** (leicht/mittel/schwer);
  pro Tag/Stufe eine eigene, für alle identische Challenge (6 Runden: 3 Text + 3 Bild).
- **Text-Fälschungen** über [OpenRouter](https://openrouter.ai) (viele Modelle, ein Key).
- **Bild-Fälschungen** über [Replicate](https://replicate.com) (verschiedene Modell-Generationen je Stufe).
- **Auth + Leaderboards** über Firebase Authentication + Firestore: **3 Tages-Leaderboards**
  (pro Stufe, ohne Login via anonymer Auth) + **1 kombiniertes Global-Ranking**
  (Gesamt-Meisterschaft, kumulativ, nur eingeloggt).
- **Schwierigkeit** = Modell pro Stufe, zentral konfiguriert in `functions/src/config/tiers.ts`
  (jede Stufe ist eine Liste – später einfach weitere Modelle ergänzen).

## Endpunkte (Callable Functions)

| Function | Zweck |
|---|---|
| `getTiers` | Stufen + verwendete Text-/Bildmodelle samt lehrreicher Beschreibung (für die Stufen-Auswahl). Kein Login. |
| `synthesizeSpeech` | Liest Text per ElevenLabs vor (`{ text }`), cacht das MP3 in Firebase Storage, liefert `{ url, cached }`. Login nötig. |
| `getDailyChallenge` | Heutige Challenge der gewählten Stufe (`{ difficulty }`), **nur aus Cache**. Antwort `{ date, difficulty, available, rounds }`; `available:false`, wenn keine existiert (keine Lazy-Generierung). Lösung entfernt. |
| `startDailyRun` | Setzt einmalig den Start-Zeitstempel (`{ difficulty }`) für die Zeitmessung. Vor Runde 1 aufrufen. Login nötig. |
| `getMyDailyStatus` | Status pro Stufe für heute: `{ date, results:{ leicht: {score,correct,total,durationMs} \| null, ... } }` (null = noch nicht gespielt). Für Menü-Sperre + Punkteanzeige. Login nötig. |
| `submitDailyScore` | Wertet serverseitig aus (`{ difficulty, guesses, displayName }`), 1 Versuch/Tag/Stufe, berechnet `durationMs` serverseitig, schreibt Tages-Score + (bei Login) Global-Total, liefert Auflösung + `durationMs`. |
| `dailyChallenge` | Cron (täglich 00:00 Europe/Berlin): erzeugt alle 3 Stufen-Challenges vor. |
| `adminGenerateChallenge` | HTTP (Token-geschützt): erzeugt Challenges **manuell** (überschreibt vorhandene). Generierung passiert nur hier + im Cron. |
| `adminGetChallengeRange` | HTTP (Token): Status mehrerer Tage (`{ date, days }`) für die Übersicht. |
| `adminGetChallengeDetail` | HTTP (Token): volle Challenge inkl. Lösung + Modell (`{ date, difficulty }`). |
| `adminRerollRound` | HTTP (Token): würfelt eine einzelne Runde neu (`{ date, difficulty, roundId }`). |

## Datenmodell (Firestore)

| Collection | Inhalt | Zugriff |
|---|---|---|
| `library/{id}` | kuratierte Bibliothek (zur Laufzeit; `library.ts` = Seed) | nur Functions / Admin |
| `dailyChallenges/{date_difficulty}` | Challenge inkl. Lösung | nur Functions |
| `dailyScores/{date_difficulty_uid}` | Tages-Score (anonym ok) | lesbar; Schreiben nur Functions |
| `globalScores/{uid}` | kumulatives Global-Total (nur Login) | lesbar; Schreiben nur Functions |

Ranglisten liest das Frontend direkt aus Firestore – **Punkte primär, Zeit als Tiebreaker**:
`dailyScores` mit `where date`+`difficulty`, `orderBy(score desc, durationMs asc)`;
`globalScores` `orderBy(totalScore desc, totalDurationMs asc)` (Indizes in `firestore.indexes.json`).

## Setup

1. **Firebase-Projekt** anlegen und ID in `.firebaserc` (`DEIN_FIREBASE_PROJEKT_ID`) eintragen.
   Authentication (Google-Anmeldung) und Firestore in der Firebase-Konsole aktivieren.
2. **Abhängigkeiten installieren**
   ```bash
   cd functions && npm install
   ```
3. **Secrets setzen** (sicher im Secret Manager, nicht im Code):
   ```bash
   firebase functions:secrets:set OPENROUTER_API_KEY   # sk-or-v1-…
   firebase functions:secrets:set REPLICATE_API_KEY    # r8_…
   firebase functions:secrets:set ADMIN_TOKEN          # frei wählbares Geheimnis für den Admin-Endpoint
   firebase functions:secrets:set ELEVENLABS_API_KEY   # für das Vorlesen der Gedichte (TTS)
   ```
   Außerdem **Firebase Storage** in der Konsole aktivieren (Default-Bucket) – dort cacht das TTS die MP3s.
4. **Lokal testen** (Emulator):
   ```bash
   npm run serve
   ```
5. **Deployen** (inkl. Firestore-Index für die Tages-Ranglisten)
   ```bash
   firebase deploy --only functions,firestore:rules,firestore:indexes
   ```

In der Firebase-Konsole **Authentication** aktivieren: Anbieter **Anonym** (für das
Spielen ohne Login) und **Google** (fürs Global-Ranking).

6. **Erste Challenge erzeugen** (der Cron läuft erst ab der nächsten Mitternacht):
   ```bash
   curl -X POST "https://us-central1-ki-duell.cloudfunctions.net/adminGenerateChallenge" \
        -H "x-admin-token: <ADMIN_TOKEN>"
   ```
   Erzeugt heute alle drei Stufen. Optional gezielt: `?difficulty=schwer` und/oder `?date=YYYY-MM-DD`.

## Challenges generieren

- **Automatisch:** Cron `dailyChallenge` täglich 00:00 Europe/Berlin (alle 3 Stufen, nur falls fehlend).
- **Manuell:** `adminGenerateChallenge` (s. o.) – überschreibt vorhandene; nützlich für den ersten Tag,
  zum Auffrischen oder zum Vorab-Generieren eines bestimmten Datums.
- **Kein On-Demand:** `getDailyChallenge` generiert NICHT mehr; fehlt eine Challenge, zeigt das Frontend
  „keine Challenge verfügbar".

## Admin-Oberfläche (lokal)

Statt curl gibt es eine kleine lokale Admin-Seite (`admin/index.html`, ohne Build):

```bash
cd functions && npm run admin   # serviert ../admin auf http://localhost:5055
```

Im Browser öffnen, **Basis-URL** + **Admin-Token** eintragen (wird lokal gespeichert). Sie zeigt:
- **Tages-Challenges** pro Stufe (vorhanden/fehlt, Rundenzahl, erzeugt am) mit „Neu erzeugen"-Buttons,
- die **kuratierte Bibliothek** (Bild-Thumbnails, Text-Vorschau, Quelle) mit **Anlegen / Bearbeiten /
  Löschen** und **„Seed laden"** (Erstbefüllung der `library`-Collection aus `library.ts`).

> **Reihenfolge nach dem allerersten Deploy:** zuerst **„Seed laden"** (befüllt die Bibliothek),
> dann **„Alle neu erzeugen"** (erstellt die Challenges). Ohne befüllte Bibliothek können keine
> Challenges erzeugt werden.

## Bibliothek pflegen (`functions/src/lib/library.ts`)

- Die `original`-Inhalte müssen **echte, gemeinfreie Werke** sein – niemals KI-generiert.
- Bild-Einträge brauchen eine echte gemeinfreie Bild-URL (Platzhalter `TODO_...` ersetzen);
  Einträge mit Platzhalter werden aus der Tages-Challenge automatisch ausgelassen.
- Für mehr Spielreiz bevorzugt **weniger bekannte** Werke ergänzen.

## Modelle anpassen (`functions/src/config/tiers.ts`)

Pro Stufe (`leicht`/`mittel`/`schwer`) eine Liste von Modellnamen für `text` (OpenRouter)
und `image` (Replicate). Weitere Modelle einfach zur Liste hinzufügen – der Proxy wählt
pro Runde eines aus.
