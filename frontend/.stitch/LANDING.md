# Landing Page Brief — Echt oder KI?

> Page-specific brief for **the landing page** of *Echt oder KI?*. Read together with `DESIGN.md` in this directory: that file defines the visual language; this file defines what *this one page* must say and do. Not a Google-standardized format — community best practice. Plain Markdown so Stitch, Claude Code and human reviewers can all read and edit it.

## Goal & Funnel

The single, only, immovable purpose of this page: turn a first-time visitor into someone who clicks **„Jetzt spielen"** and ends up at the game's `WelcomeView`. Nothing else competes with that goal.

Secondary funnel goal: of those who play, convert the most curious into a **Google login** so they appear in the global leaderboard. This is a soft secondary CTA, never blocks playing, never appears before someone has at least understood the concept.

Hard non-goals: no email capture, no newsletter, no „Trusted by", no testimonial slider, no pricing, no app-store badges (it's a web game), no comparison table.

## Audience & Mindset

- **Primary persona — the curious art-aware adult.** Reads, looks at art occasionally, has heard about generative AI, has not formed strong opinions about it. Comes in skeptical (about AI quality, or about the site itself), leaves either humbled or smug. Either is fine; both will share it.
- **Secondary persona — the AI-curious technologist.** Wants to see how good current text/image models are at imitating style. Recognises model names (GPT, Claude, FLUX). Will read the difficulty section closely.
- **Tertiary persona — teachers and journalists.** Considering the game as a discussion piece. Need the educational angle visible without being preached at.

Mental model entering the page: *„Another AI gimmick? Show me, then."* The page has to earn the click in seconds, not minutes.

## Voice & Tone

- **Language:** German, „du"-Anrede everywhere. No English chrome words sprinkled in (no „Pro Tip", no „Coming soon").
- **Tone:** calm, confident, slightly menacing — gallery quiet meets uncanny valley. Never chipper, never marketingy.
- **Cadence:** short sentences. Strong verbs. The page should read aloud well.
- **Forbidden phrases:** „revolutionär", „spielerisch lernen", „künstliche Intelligenz spielerisch entdecken", „die ultimative Herausforderung", anything with „!!" or em-dash overload.

## Key Message (5-second hook)

The visitor must leave the hero with this one thought in their head:

> **„Zwei Werke. Ein Mensch, eine KI. Ich soll die KI erkennen — und ich bin mir nicht so sicher, ob ich das kann."**

Everything below the hero deepens or pays off this thought. Nothing introduces a new core idea.

## Sections (in order)

For each section: **Purpose · Layout note · Verbatim copy · CTA(s)**.

Verbatim copy is what should literally appear, modulo small edits. Stitch should NOT invent new statistics, testimonials, or claims; every number or fact must come from this brief.

---

### 1. Hero — „Echt oder KI?"

**Purpose:** Identify the product, plant the key message, offer the primary CTA. Above the fold on a 1280×720 viewport.

**Layout:**
- Centred column over the live WebGL background.
- Wordmark lockup (existing `AnimatedLogo` component — *do not redraw a new logo*).
- Tagline directly under the lockup.
- One sentence summarising the concept.
- Single primary CTA `Jetzt spielen`. Below it a small secondary text link „Wie funktioniert das?" that smooth-scrolls to section 3.
- No hero image. The WebGL background is the imagery.

**Copy (verbatim):**

- **Wordmark:** *Echt oder KI?* (rendered via the existing lockup component)
- **Tagline:** „Trainiere dein Auge für künstliche Kunst."
- **Sub-headline (1 sentence, ~20 words):**
  „Zwei Werke pro Runde — eines hat ein Mensch geschaffen, eines hat eine KI im selben Stil gefälscht. Welches ist welches?"
- **Primary CTA label:** „Jetzt spielen"
- **Secondary link:** „Wie funktioniert das?"

**CTA target:** scroll to game app (`/play` route in same Vite app, or `https://<game-domain>` if split deploy).

---

### 2. Concept demo — „So sieht das aus"

**Purpose:** Pay off the key message immediately. Show one real pair so the visitor *feels* the difficulty before reading any explanation.

**Layout:**
- Two square panels side by side (same `cyber-panel` material as in-game), labelled `WERK A` and `WERK B` using the same pill-chip the game uses.
- Above them, a single line: „Welches Werk ist die Fälschung?"
- Below them, a small `Auflösen`-Button that reveals which is which (toggle state). On reveal, a thin caption appears under each panel: artist · title · museum source for the real one; model name for the AI one.
- Use one **real museum scan** (e.g. a less-iconic Met CC0 painting) and **one AI fake** generated for it. The fake should look strong — this is not a softball.

**Copy:**
- **Heading:** „So sieht das aus"
- **Subhead (one line):** „Eines dieser Werke ist echt. Das andere hat eine KI im selben Stil erfunden."
- **Reveal button:** „Auflösen"
- **Real reveal caption template:** „Echt — {Künstler}, {Werk}, {Quelle}."
- **AI reveal caption template:** „KI-Fälschung — generiert von {Modell}, im Stil von {Künstler}."

**Stitch note:** Use placeholder image URLs for the static page. The final images will be wired in during code integration.

---

### 3. So funktioniert's

**Purpose:** Explain the game loop in three steps without being a tutorial.

**Layout:** three glass panels in a row (stack on mobile). Each panel: small mono-uppercase number („01 / 02 / 03"), short heading, two-line description, single Lucide icon (outline, stroke 1.5).

**Copy:**

| # | Heading | Body |
|---|---|---|
| 01 | „Stil-Match" | „Jede Runde zeigt zwei Werke vom selben Künstler zum selben Motiv — eines echt, eines KI." |
| 02 | „6 Runden, 3 Texte, 3 Bilder" | „Gedichte, Prosa und Gemälde im Wechsel. Du tippst auf das Werk, das du für die Fälschung hältst." |
| 03 | „Eine Challenge pro Tag" | „Jeden Tag eine neue Auswahl — gleich für alle Spieler. Pro Tag und Stufe ein Versuch." |

**Icons (suggested):** `Layers` (01), `Image` + `Type` paired (02), `Calendar` (03).

---

### 4. Schwierigkeitsstufen — „Wie weit ist die KI?"

**Purpose:** Sell the educational layer (different KI generations = different difficulty) and create tier-aware curiosity. This is where the AI-curious persona lingers.

**Layout:** the three tier cards from the game (re-use the in-game pattern) in a row. Each card shows: tier name, tier icon (Bot / Eye / Skull), three intensity pips, one-line description, the actual model name used.

**Copy:**

- **Section heading:** „Wie weit ist die KI?"
- **Subhead:** „Drei Stufen, drei Generationen von Sprach- und Bildmodellen. Je höher die Stufe, desto schwerer wirst du die KI von der menschlichen Hand unterscheiden."

| Tier | Heading | Tagline | Model line |
|---|---|---|---|
| leicht | „Leicht" | „Ältere Modelle — die Fälschungen verraten sich oft." | „Text: GPT-3.5 · Bild: FLUX.1 [schnell]" |
| mittel | „Mittel" | „Solide Mittelklasse — schon ordentlich, aber mit Mustern." | „Text: Gemini 2.5 Flash · Bild: FLUX.1 [dev]" |
| schwer | „Schwer" | „Aktuelle Spitzenmodelle — täuschend echt." | „Text: Claude Opus 4.7 · Bild: FLUX 1.1 Pro" |

**Note for Stitch:** the tier-card visual pattern is canonical — see `WelcomeView.tsx`. Use single-colour neon borders (no rainbow gradient). Tier colours: leicht = cyan, mittel = amber, schwer = red.

---

### 5. Lerneffekt — „Was du dabei lernst"

**Purpose:** Make the page mean something. Quick, sober, no preaching.

**Layout:** one wide glass panel, centred copy, no image. Optional small icon (Lucide `Lightbulb` or `Eye`).

**Copy:**

- **Heading:** „Was du dabei lernst"
- **Body (one paragraph, ~50 words):**
  „Du trainierst dein Auge — und kalibrierst dein Bauchgefühl gegen den Stand der Technik. Wo erkennt der Mensch noch zuverlässig die Maschine? Wo nicht mehr? Jede Auflösung zeigt dir, welches Modell die Fälschung erzeugt hat. Du verlässt das Spiel mit einem realistischen Bild davon, wie weit generative KI heute ist — und wo sie noch scheitert."

---

### 6. Bestenliste-Teaser

**Purpose:** Social proof without testimonials. Show that other people play, that there is a daily ranking, hint at the global leaderboard.

**Layout:** a compact version of the in-game `LeaderboardView` (same columns: RANG · SPIELER · PUNKTE · TREFFER · ZEIT) with 4–5 example rows. A small toggle „Heute" / „Gesamt" above the table — purely visual on the landing, no real data fetching; or use real top-5 data if straightforward.

**Copy:**

- **Heading:** „Wer erkennt die KI am besten?"
- **Subhead:** „Tägliche Rangliste pro Stufe — global, wenn du eingeloggt bist."
- **Toggle labels:** „Heute" · „Gesamt"
- **CTA (secondary, after the table):** „Zur vollen Rangliste" → links to leaderboard route in the game app.

---

### 7. FAQ — drei Fragen, knapp

**Purpose:** Address the only three objections that actually block a click: legitimacy, cost, anonymity.

**Layout:** three collapsible (`details/summary`) or three small panels.

**Copy:**

| Frage | Antwort |
|---|---|
| „Sind die echten Werke wirklich von Menschen?" | „Ja. Jedes Original ist ein wortgetreues gemeinfreies Werk (Lyrik, Prosa, Gemälde) oder ein Met-Museum-Scan. Nur die Fälschung entsteht durch eine KI." |
| „Was kostet das?" | „Nichts. Kein Konto nötig — gib einen Namen ein und spiel los. Mit Google-Login zählst du zusätzlich in der globalen Rangliste." |
| „Werden meine Daten gespeichert?" | „Nur das, was für die Rangliste nötig ist (Spielername, Score, Zeit). Anonyme Spieler hinterlassen keinen Account, nur einen Tageseintrag." |

---

### 8. Final CTA

**Purpose:** Last chance to convert the still-undecided. Big, calm, clear.

**Layout:** centred block over the WebGL background (panel translucent enough to let the grid breathe). Heading, one line, two buttons stacked.

**Copy:**

- **Heading:** „Bereit, dein Auge zu testen?"
- **One-line:** „Heutige Challenge wartet. Pro Stufe ein Versuch."
- **Primary CTA:** „Jetzt spielen"
- **Secondary CTA:** „Mit Google anmelden für globales Ranking"

---

### 9. Footer

**Purpose:** Legal, credit, low-priority links. Mono labels, on-surface-variant text.

**Copy:**

- **Left:** „Echt oder KI? — ein nicht-kommerzielles Projekt von Henrik."
- **Middle:** Links — „Über das Projekt" · „Bibliothek-Quellen" · „Impressum" · „Datenschutz". (Links können vorerst auf `#` zeigen; werden in der Code-Integration verdrahtet.)
- **Right:** „Bilder: Met Museum (CC0). Texte: Project Gutenberg / Wikisource. KI-Fälschungen: OpenRouter · Replicate · ElevenLabs."

## Primary CTA & Conversion

There is exactly **one** primary CTA on this page: **„Jetzt spielen"**. It appears:

1. In the hero (above the fold)
2. In the final CTA block (section 8)

Optionally a small sticky version of it can appear in the header after scrolling past the hero — minimal, transparent until needed. Avoid more than two simultaneous primary CTAs in the viewport.

The Google-login CTA is **always secondary**, never above „Jetzt spielen" in visual hierarchy.

## Constraints & Anti-Goals

- **No SEO landing-page tropes.** No „Trusted by 10,000+", no logos bar, no testimonial slider, no „as seen in", no team photos, no pricing tiers.
- **No hero illustration.** The WebGL background is the imagery. Don't add stock vector art, isometric scenes, gradient orbs, or AI-generated „hero" images.
- **No newsletter signup.** This is not a content site.
- **No claims we can't back up.** Don't write „die schwerste Herausforderung im Netz" or „über 1.000 Werke" unless we actually have those numbers.
- **No emoji or playful illustration.** Tone is contemplative.
- **No tier-colour mixing.** Cyan, amber, and red appear only in their respective tier card; never together as a gradient.

## Generation Notes for Stitch

Specific instructions that Stitch should treat as hard constraints on top of `DESIGN.md`:

1. **Reuse the existing wordmark lockup** (`AnimatedLogo` from `frontend/src/components/AnimatedLogo.tsx`). Do not generate a new logo, do not letter-treat „Echt oder KI?" yourself — render the lockup as a placeholder block with the note „lockup component goes here" and the correct vertical space reserved. Final code will wire in the real component.
2. **Reuse the WebGL background** (`CyberBackground.tsx`). Show it as the persistent layer behind all panels. Do not draw a substitute background, do not fill the body with a flat gradient.
3. **Glass panels everywhere.** Every content block sits on a translucent glass panel as defined by `panel-glass` in `DESIGN.md`. The background must show through.
4. **Sharp corners everywhere except modals.** Even cards in this landing keep `rounded.none`. There are no modals on the landing page itself.
5. **Single-colour neon for accents.** No rainbow / multi-hue gradient borders or shadows on hover or selection. Match the tier card pattern exactly.
6. **One primary CTA style, one secondary.** Primary CTA uses `button-primary` tokens exactly. Secondary uses `button-icon` outlined style enlarged to button height, or a plain text link with cyan hover.
7. **Header chrome.** Optional small fixed top-right cluster of two icon chips: language (German default; future-proof) and theme (always dark — but the chip is a visual nod to system-aware design). Keep it sparse.
8. **No mobile detour.** Design for desktop first (1280–1440 width) and let the existing CSS rules collapse to mobile. Do not invent a separate mobile experience.
9. **Output format.** Generate as React + Tailwind, single page composed of section components named `HeroSection`, `ConceptDemoSection`, `HowItWorksSection`, `DifficultyTiersSection`, `EducationSection`, `LeaderboardTeaserSection`, `FaqSection`, `FinalCtaSection`, `FooterSection`. Each in its own file. No external state.
10. **Imagery.** Use a single sample real artwork (any CC0 Met painting) and a single AI sample (placeholder); the brief author will wire in real ones during integration.

## Out of Scope (for this page)

- Login screen (lives in the game app).
- Tutorial / onboarding flow (the help modal in the game handles that).
- Account management.
- Localisation beyond German.
- Mobile-specific layouts beyond what natural responsive collapse provides.
