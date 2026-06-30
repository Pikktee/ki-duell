---
version: alpha
name: Echt oder KI?
description: Cyber-museum design system for a daily-challenge game pitting real public-domain artworks against AI fakes in the same style. Dark, two-neon duel over an audio-reactive WebGL grid.

colors:
  surface: "#080808"
  surface-container: "#1A1A1A"
  surface-container-high: "#222222"
  on-surface: "#E0E0E0"
  on-surface-variant: "#9A9A9A"
  outline: "#3A3A3A"
  primary: "#00FF9C"
  on-primary: "#080808"
  secondary: "#FF007F"
  on-secondary: "#080808"
  tier-easy: "#00FF9C"
  tier-medium: "#FFB000"
  tier-hard: "#FF3333"
  on-tier: "#080808"
  accent: "#CCFF00"
  error: "#FF3333"
  on-error: "#080808"

typography:
  display-lockup-serif:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: "700"
    lineHeight: 1
    fontFeature: "\"ital\" on"
  display-lockup-tech:
    fontFamily: Orbitron
    fontSize: 72px
    fontWeight: "800"
    lineHeight: 1
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.5
  label-mono-lg:
    fontFamily: Courier New
    fontSize: 14px
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: 0.2em
  label-mono-md:
    fontFamily: Courier New
    fontSize: 12px
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: 0.2em
  label-mono-sm:
    fontFamily: Courier New
    fontSize: 10px
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: 0.2em
  tagline:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 1.4
    letterSpacing: 0.3em

rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 16px
  full: 9999px

spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 896px
  panel-padding: 32px
  card-padding: 24px

components:
  panel-glass:
    backgroundColor: rgba(15, 15, 15, 0.72)
    textColor: "{colors.on-surface}"
    rounded: "{rounded.none}"
    padding: "{spacing.panel-padding}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-mono-lg}"
    rounded: "{rounded.none}"
    height: 56px
    padding: 16px
  button-primary-hover:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-primary}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface-variant}"
  button-destructive:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-mono-lg}"
    rounded: "{rounded.none}"
    height: 56px
    padding: 16px
  button-icon:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    rounded: "{rounded.none}"
    size: 36px
    padding: 8px
  button-icon-hover:
    backgroundColor: rgba(0, 255, 156, 0.1)
    textColor: "{colors.primary}"
  tier-card-easy:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.tier-easy}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-padding}"
  tier-card-medium:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.tier-medium}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-padding}"
  tier-card-hard:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.tier-hard}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-padding}"
  tooltip:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 16px
    width: 250px
  modal:
    backgroundColor: rgba(15, 15, 15, 0.72)
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel-padding}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-mono-md}"
    rounded: "{rounded.none}"
    padding: 8px
    height: 32px
  input-field-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
---

# Echt oder KI? — Design System

## Overview

A cyber-museum hybrid. The game shows two works by the same artist on the same theme — one real, one AI-generated in that same style — and the visual identity expresses that duel directly: a near-black canvas with two saturated neons (cyan for the real/human side, magenta for the synthetic side) laid over an audio-reactive WebGL grid. Surfaces are translucent glass panels floating above this background; chrome speaks in monospaced uppercase labels with wide letter-spacing, like an analytical instrument. The mood is contemplative and slightly uncanny — gallery stillness meets retro-futurism — never playful. Voice is German, second-person, confident, free of marketing fluff. Tagline: „Trainiere dein Auge für künstliche Kunst."

## Colors

A composition uses at most two saturated neons at once — the cyan/magenta duel, or one tier color combined with cyan. Tier colors never appear together in the same component.

- Surface is `#080808` (neutral near-black, never blue-tinted, never pure `#000`).
- Cyan `#00FF9C` is the „real/human" side (CTAs, focus rings, leicht tier).
- Magenta `#FF007F` is the „AI/synthetic" side (wordmark second half, destructive actions, errors, abgebrochen state).
- Tier accents are single-color only: cyan (leicht), amber `#FFB000` (mittel), red `#FF3333` (schwer).
- Toxic yellow `#CCFF00` is reserve, used very sparingly.
- Body text is `on-surface` at full opacity; muted use `on-surface-variant` (~60%); disabled ~30%.

Every text/background pair clears WCAG AA 4.5:1 (on-surface on surface ≈ 13:1, primary text on primary fill ≈ 15:1).

## Typography

Three fonts. Inter carries everything functional and prose. Courier New is chrome — micro-labels, section headings, CTA labels — always uppercase with `0.2em` letter-spacing. Two display faces share the stage only inside the wordmark lockup: Playfair Display Italic 700 for *„Echt oder"* (gallery elegance) and Orbitron Extra-Bold for *„KI?"* (geometric, synthetic).

The magenta *„KI?"* in the lockup gets a glitch-text treatment: cyan + magenta chromatic clones clipped in stutters every ~4s, continuous activation while audio bass > 0.35. Tagline directly under in Inter `0.3em` tracking at 60% opacity. Hierarchy: headlines Inter 700, body Inter 400, micro-chrome Courier mono 700. Body line-height 1.5–1.6 to balance dense glass surfaces. Numerals and codes use a mono label token — reads as „instrument data".

## Layout

Single centred column with `container-max: 896px`. Spacing on a 4 px base. Dominant rhythm: `sm` (8 px) in-row gaps, `md` (16 px) component padding, `lg` (24 px) card padding, `xl` (32 px) panel padding, `xxl` (48 px) between sections.

- Hero: wordmark lockup centred above the fold, WebGL background visible behind it; CTA centred below the tagline.
- Header chrome: fixed top-right cluster of 36×36 sharp-cornered icon buttons (`gap-2`).
- Section labels above headings use the smallest mono token with `0.3em` tracking in primary cyan — they read like control-panel headers.
- No multi-column dashboards. Even leaderboards stay one table. Density comes from typography, not column count.

## Elevation & Depth

Hierarchy by layered glass over a constant moving background, not by drop-shadow stacks.

- Level 0 — WebGL cyber-grid covers the entire viewport (`z: -50`), audio- and cursor-reactive, never covered by an opaque element.
- Level 1 — glass panel: `backdrop-filter: blur(20px)`, fill `rgba(15,15,15,0.72)`, top-down internal highlight gradient (white 8% top → transparent → black 52% bottom), 1 px gradient edge (white 30% top → 5% middle → 10% bottom) via inset masked element.
- Level 2 — modal: same material with `rounded.lg` corners — the only rounded surface. Overlay `bg-black/80 backdrop-blur(8px)`, dialog pop-in 0.4 s `cubic-bezier(0.16, 1, 0.3, 1)`.
- Shadow: single deep drop (`0 20px 50px -10px rgba(0,0,0,0.8)`) + inset white hairline top. No layered ambient shadows.
- Optional beat reactivity: components opt into the `--beat` CSS var (0–1 low-pass bass) and scale neon `text-shadow`/`box-shadow` radii with it. Used on wordmark + WebGL background.
- Always provide a `prefers-reduced-motion: reduce` fallback that drops `backdrop-filter` and animation, replacing them with a solid darker gradient.

## Shapes

Architectural and sharp. Every interactive element, panel, card, input, and tooltip uses `rounded.none` (0 px). The single exception is the **modal**, which uses `rounded.lg` (16 px) to read as a separate „dialog object". Pill chips (`rounded.full`) only for diagonal status banderoles („Gespielt" / „Abgebrochen").

## Components

**Glass panel** — the canonical container, layered over WebGL background. SVG fractal-noise overlay at 4% opacity with `mix-blend-mode: overlay` to break the flatness; optional 1 px horizontal scan-line repeat at 3% white for CRT feel.

**Primary button** — solid neon fill, black text, mono uppercase label, sharp corners, soft same-color glow (`0 0 15px rgba(neon,0.3)`). Hover swaps fill to white and brightens the glow. Focus ring is 2 px of the same neon. On a tier card the primary swaps cyan for the tier color.

**Destructive button** — identical layout in magenta. Reserved for logout, abandon-run, etc.

**Icon button** — square 36×36, 1 px translucent outline, transparent fill, on-surface icon. Hover paints outline + 10% tier-tinted fill + 15 px glow.

**Tier card** — glass panel with centred icon chip, tier label (`text-2xl`, uppercase, tracking-widest, tier color when selected), three pip bars indicating intensity, one-line sub-description, info icon with portal tooltip. Hover and selection always paint the same single-color neon border with same-color glow — never a multi-hue gradient. Diagonal corner ribbon when daily attempt is consumed: cyan for completed, magenta-red for abandoned.

**Tooltip** — portal'd into `document.body`. 250 px wide, glass fill, 1 px cyan border, `body-sm` text, small `rotate-45` arrow inheriting the border points at the anchor. Auto-flips above/below based on viewport space.

**Modal** — fullscreen overlay, centred dialog at `rounded.lg`, sticky header (title + close), scrollable body with `cyber-scrollbar` (6 px, cyan thumb), sticky footer with primary CTA.

**Input field** — solid black fill, 1 px `on-surface/30` border, mono font, 32 px height, 8 px padding. Focus replaces the border with primary (no outline, no glow).

**Icons** — Lucide outline only, stroke-width 1.5 for large display icons, 2 for inline UI. Never filled, never colored beyond the current text color.

## Do's and Don'ts

- Do lay every panel as translucent glass over the WebGL grid — the moving grid is the constant of the system.
- Do keep cyan for the „real/human" side and magenta for the „AI/synthetic" side whenever the duality appears.
- Do use the two display faces (Playfair italic + Orbitron) together **only** inside the wordmark lockup. Elsewhere choose one display face *or* the mono label, never both in one heading.
- Do use sharp corners for every component except modals. Pill chips only for status banderoles.
- Do respect `prefers-reduced-motion: reduce` — every animation has an opacity-only fallback; `backdrop-filter` is dropped.
- Do use Lucide outline icons exclusively.
- Don't mix two tier colors in the same component (no amber and red together, no cyan-card with red-button).
- Don't use rainbow or multi-hue gradient borders or shadows. Hover and selection get a single-color neon stroke + same-color glow.
- Don't introduce SaaS-style hero gradients, stock vector illustration, isometric art, 3D rendered hero shots, or gradient orbs.
- Don't use emoji, playful illustration, or cartoon mascots — the tone is contemplative.
- Don't use `#000` as background; the canvas is `surface (#080808)`. Don't blue-tint the dark.
- Don't cover the full viewport with an opaque panel — the WebGL background must remain visible through the glass.
