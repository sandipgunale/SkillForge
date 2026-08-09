# DESIGN.md — SkillForge

Source of truth for visual design. Approved via /design-shotgun (2026-08-08,
Variant A "Ember Forge") and finalized via /design-html. Applies to the
engineering showcase (`/showcase`) and matches the existing Forge system in
`skillforge-frontend/src/lib/design-system.js`.

## Brand tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#070d1b` | Base dark canvas |
| `--panel` | `rgba(16, 26, 46, 0.72)` | Glass surfaces |
| `--glass` | `rgba(255, 255, 255, 0.045)` | Subtle glass fill |
| `--line` | `rgba(148, 163, 184, 0.14)` | Hairline borders |
| `--ember` | `#fbbf24` | Primary accent (amber) |
| `--ember-glow` | `rgba(251, 191, 36, 0.35)` | CTA glow |
| `--aurora` | `#2dd4bf` | Secondary accent (teal) |
| `--text` | `#e2e8f0` | Primary text |
| `--muted` | `#7c8aa5` | Secondary text |

Background: radial `aurora` at top-right (10%), radial `ember` at bottom-left
(8%) over `--bg`.

## Typography

- Display/UI: **Geist** (weights 500, 600, 640, 700, 750, 800) — fallback
  Inter / system-ui.
- Numeric/annotations: **Geist Mono** — fallback ui-monospace / Consolas.
- Headline: `clamp(40px, 6.2vw, 66px)`, weight 750, tracking `-0.03em`, line-height 1.04.
- Eyebrow: mono, 12px, tracking `0.22em`, uppercase, aurora; 34px ember→aurora rule before.
- Body: 15–17px, line-height 1.65, `#9fb0c8`.

## Shape & motion

- Radii: `--r-lg: 16px` (metrics grid), `--r-md: 12px` (CTAs), chapter cards 14px.
- CTA primary: `linear-gradient(180deg, #ffd166, var(--ember) 60%)`, text `#1c1203`,
  shadow `0 10px 34px var(--ember-glow)`, hover `translateY(-2px)`.
- Chapter card hover: `translateY(-3px)`, border ember 45%, 3px ember→aurora bar on left.
- Metric card: glass `backdrop-blur(14px)`, 3px gradient counter bar underneath.
- All motion respects `prefers-reduced-motion` (no transitions/transform).

## Layout

- Max content width 1180px; gutter `clamp(24px, 5vw, 56px)`.
- Metrics grid: `repeat(auto-fit, minmax(180px, 1fr))`, 1px gaps over `--line`.
- Chapters grid: `repeat(auto-fit, minmax(160px, 1fr))`, 12px gap.
- Sticky topbar with `backdrop-blur(14px)` over 82% bg.
- Deep-dive strip: dashed aurora border, mono 12px.

## Content rules (showcase)

- Real numbers only (37 commits, 224 Java, 296 frontend, 20 migrations) —
  pulled from the manifest (see plan G1–G4), never hardcoded prose.
- Core chapters 01–05: The Stack, Architecture, Auth & Security, The AI
  Engine, Performance. Deep dives: Database, API Explorer, Timeline.
- Footer snapshot line: `Snapshot refreshed · <month year>` + UTC time.
