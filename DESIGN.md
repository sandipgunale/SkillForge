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

---

# Landing Design System — "Foundry Precision"

Approved via /design-consultation (2026-08-17, HTML preview approved). Applies
to the landing page (`/` and marketing routes, per the landing rebuild plan in
`docs/PLAN-landing-rebuild.md`). The showcase system above remains the source
of truth for `/showcase`.

## Product Context

- **What this is:** SkillForge — AI-powered learning platform. Landing = the
  marketing narrative page for the product (auth, curated resources, AI-graded
  quizzes, AI learning paths + workspace, gamified progress, analytics).
- **Who it's for:** self-learners forging new skills (career-oriented adults).
- **Space/industry:** AI edtech. Reference tier (principles only — never copy):
  ui8.ai/forge, scfo.de, southernlifts.com.au, landonorris.com.
- **Project type:** marketing landing page — 15-section narrative scroll (00–14).

## Aesthetic Direction

- **Direction:** Foundry Precision — industrial craft: a precision instrument
  forged in a foundry. Dark iron surfaces, hairline grids, engineering labels,
  one molten-metal accent.
- **Decoration level:** intentional — section numerals, hairline rules, subtle
  forge glow. No blobs, no gradients, no grain overlays.
- **Mood:** dark iron precision carrying molten copper heat; the "forge of
  knowledge" metaphor made literal and structural.
- **Memorable thing (drives every decision):** "The Forge of Knowledge — a
  graduation cap passes through the knowledge graph and returns transformed."
- **Anti-convergence:** showcase owns amber/glass (Ember Forge). The landing
  deliberately varies the forge family: copper instead of amber, chiseled
  Cabinet Grotesk instead of Geist, no glass panels.

## Typography

- **Display/Hero:** Cabinet Grotesk (weights 500–900, tracking −0.02em,
  line-height 1.04) — chiseled, confident, industrial-modern. Fontshare CDN:
  `https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800,900&display=swap`
- **Body:** Instrument Sans (400–600, line-height 1.6) — warm, legible at
  length; Google Fonts.
- **UI/Labels/Data:** IBM Plex Mono (400–500, tabular-nums) — instrument-panel
  labels, section numerals 00–14, metrics, nav; Google Fonts. Labels: 11px,
  tracking 0.22em, uppercase, copper.
- **Scale (clamp):** display-1 `clamp(2.6rem, 7vw, 5rem)` weight 900; display-2
  `clamp(1.9rem, 4.5vw, 3rem)` weight 800; display-3 `clamp(2.2rem, 5vw, 4.25rem)`
  weight 800 (section statements, e.g. FAQ `T.h2`); h3 `clamp(1.35rem, 2.6vw, 1.8rem)`
  weight 700; body 1rem; small 0.875rem (FAQ answers, footer notes); label mono
  0.6875rem.
- **Anti-slop:** no Inter/Roboto/system-ui primary; no Space Grotesk.

## Color

- **Approach:** balanced — molten copper (forge heat) + steel blue
  (intelligence) + iron neutrals; color is meaningful, never decorative.
- **Dark mode (primary):** bg `#0b0e13` (iron); surface `#12161d`; surface-2
  `#1a2029`; border `rgba(210,220,235,.10)`; text `#eef2f7` (bone); muted
  `#93a1b3`; faint `#7d8a99`; **accent `#ff8a3d` (molten copper)**; accent-strong
  `#ffa05e`; accent-ink `#1a0d04`; secondary `#5ea2f0` (steel blue); accent glow
  `0 0 0 1px rgba(255,138,61,.14), 0 0 42px rgba(255,138,61,.10)`.
- **Light mode:** bg `#f7f5f1` (limestone); surface `#ffffff`; surface-2
  `#f0ede7`; border `rgba(23,27,33,.12)`; text `#171b21`; muted `#5c6b7a`;
  faint `#5f6b78`; accent `#c24a15` (deep copper, AA-darkened); accent-strong
  `#b8461a`; accent-ink `#fff7f0`; secondary `#2563b5`.
- **Semantic:** success `#34d399`/`#15803d`, warning `#fbbf24`/`#b45309`, error
  `#f87171`/`#b91c1c`, info `#60a5fa`/`#1d4ed8` (dark/light). Alerts are
  hairline-bordered with colored status dots — never filled backgrounds.
- **Dark mode strategy:** each mode redesigned (not inverted); light mode
  darkens and desaturates the accent for WCAG AA contrast.
- **Usage rules:** copper = CTAs, active states, forge glow, in-progress graph
  nodes, feedback accents; steel blue = known graph nodes, links, secondary
  info; color is never the only signal (labels + icons accompany).

## Spacing

- **Base unit:** 4px. **Density:** comfortable (marketing).
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).
- Section padding: `clamp(56px, 9vw, 120px)`; component gaps `clamp(20px, 3vw, 32px)`.

## Layout

- **Approach:** hybrid — grid-disciplined base (12 col → 8 → 4 → 1) with
  editorial breaks for the numbered narrative.
- **Max content width:** 1180px; gutter `clamp(24px, 5vw, 56px)` (matches
  showcase for cross-page rhythm).
- **Border radius:** sharp 2px (nav CTAs, sheet menu items), sm 4px
  (buttons/inputs), md 8px (cards), lg 14px (panels/mockups), full 999px
  (chips/toggles). Never uniform-bubbly.
- **Wayfinding:** mono numerals 00–14 persist as editorial section labels
  (00 ARRIVAL … 13 MASTERY … 14 FOOTER), copper with hairline rule.
- **CTA hierarchy:** primary = copper fill + glow (shadow), secondary = hairline
  border, ghost = text only; hover only shifts color/border — no bubble effects.
- **Touch targets:** nav links and CTAs carry invisible 44px+ hit areas
  (padding on links, `h-11` on the desktop CTA) — editorial size, accessible
  reach.
- **Brand exception:** the AppLogo flame keeps its global amber — it is the
  product brand mark, not a landing token. Copper governs everything else in
  the shell.

## Motion Language

Motion is information, not decoration. Every animation must communicate meaning; generic animations are rejected. One motion library (`src/lib/motion-gsap.js`), one token source (`src/lib/design-system.js` — `DURATION`/`EASE`/`MOTION`), GSAP as the primary engine.

### The 5 layers (descending intensity)

1. **Global scene** — ambient, slow 8–16s cycles (particles, glow, aurora; `MOTION.ambient` documented constants — Three.js frame loops are math, not tweens).
2. **Section** — one named identity per landing section (see the registry in `SECTION_MOTION`, `motion-gsap.js`). Mostly scroll-driven, scrub or once-trigger.
3. **Component** — hover/click/press micro-interactions, 100–250ms, spring physics.
4. **Micro** — the smallest details: glints, line draws, number transitions, chevron rotates.
5. **Physical/3D** — hero cap: real mass, momentum, inertia, spring-dampened pointer response.

### Token mapping (the single table)

Categories are the primary key; components declare intent, never raw durations/curves. Values map onto existing constants — never revalue them.

| Category | Intent | Duration | Ease |
| --- | --- | --- | --- |
| `micro` | press, toggle, chevron rotate | `fast` (150ms) | `outExpo` |
| `ui` | component in/out (cards, modals, panels) | `base` (250ms) | `outExpo` |
| `scene` | section/scroll choreography | `entrance` (800ms) | `outExpo` |
| `physical` | mass/spring (cap, magnetic) | `base` (250ms) | `spring` |
| `scroll` | scrub/parallax | — (scroll progress, not clock) | — |
| `ambient` | 3D loops | `float` 9000 / `breathe` 6000 / `aurora` 18000 | — |

GSAP mirrors: `GSAP_EASE.{micro,ui,scene,physical}` and `MOTION_TOKENS` in `motion-gsap.js`. This table supersedes the earlier ad-hoc tiers (micro 120–180 / reveal 400–700 / cinematic 1–2s).

### Section identities (landing)

Each section declares one identity in `SECTION_MOTION` (wake, claim, trust, process, machine, formation, proof, transformation, answers, mirror, quiet, shell) and is wired via `data-motion="<identity>"`. Bespoke sections (Arrival, Mastery, ForgeGraph) register `builder` entries — the escape hatch that keeps the registry honest. **Anti-slop rule: no new section may fall back to a generic rise/fade; an identity is mandatory.** The dashboard `PRESETS.rise` is a legacy default, not a template for new work.

### Hero arc

Entrance beats at 0/100/250/400/500/600/1200ms (cap wake, halo, eyebrow, headline, subcopy, CTA cluster, ember burst) with deterministic from-states (direct style writes — no `clearProps`, the P1-1 lesson). Then the cap's 5-phase scroll: recede (hero exit) → rotate → depth → dissolve (hosted on the Mastery sticky stage) → return-differently (reformed by the knowledge net, never a replay of the entrance).

### Rules

- Compositor-friendly properties only (transform/opacity/filter); `will-change` only during active animation.
- One ScrollTrigger per section; rAF-throttled handlers; rect cached on enter (no per-move layout reads).
- Cleanup every animation via context-safe `gsap.context`/`useMotionScope`.
- **Reduced motion:** `prefers-reduced-motion` → opacity-only variants (no travel, no transforms), static cap silhouette, no parallax; input-driven micro-interactions (magnetic/tilt) disabled.
- **Mobile:** parallax 40% of desktop; magnetic off on touch; no scroll-jacking ever.
- Keyboard: every interactive motion has a `:focus-visible` equivalent; motion never replaces focus styles.
- Perf gate: Lighthouse ≥ 98 / INP < 200ms; ≤ 1 live WebGL context on the landing; device-memory particle caps; signature lazy + IO-gated, 2D canvas (not a third WebGL context).
- Theme morph: coordinated with the next-themes class swap, `DURATION.morph` (600ms), no white flash.

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-17 | Created "Foundry Precision" landing system | /design-consultation: product context + 2026 edtech/AI research (dark + vivid orange is the fresh pairing; purple = wrapper signal) + memorable-thing (Forge of Knowledge); HTML preview approved. |
| 2026-08-17 | Copper over amber | Anti-convergence: showcase owns amber/glass; landing varies the forge family. Taste signal honored by variation, not repetition. |
| 2026-08-17 | Cabinet Grotesk + Instrument Sans + IBM Plex Mono | Chiseled display, warm body, instrument-panel labels; none overused or blacklisted. |
| 2026-08-17 | Steel blue secondary only | Reserved for knowledge-graph "intelligence" — keeps palette restrained and meaningful. |
| 2026-08-18 | Sharp 2px radius tier documented | Nav CTAs and sheet items read as precision-cut; documented so it stops drifting. |
| 2026-08-18 | display-3 (4.25rem) + small (14px) tiers documented | Section statements and FAQ answers already shipped at these sizes; now codified. |
| 2026-08-18 | 44px invisible hit areas on nav links/CTA | Editorial size with accessible reach; no visual change. |
| 2026-08-18 | AppLogo keeps amber on the copper landing | Brand mark exception; everything else in the shell is copper. |
| 2026-08-19 | Motion language codified (5 layers, token mapping table, section identities) | /autoplan review: motion was functional but not a language; single mapping table supersedes ad-hoc tiers; anti-slop rule (identities mandatory). |
| 2026-08-19 | Cap phases 2–5 host on Mastery sticky stage | Design + eng reviews: hero cap leaves the viewport after recede; "through the story" needs scroll-jacking (rejected). Same emotional intent, physically visible. |
| 2026-08-19 | Dead motion hooks purged (useScrollShow/useStaggerIn/useSectionReveal/useSplitReveal/useWidgetReveal) | Three carried the banned clearProps flash pattern; dead code is bait (AGENTS.md). useReducedMotion consolidated into motion-gsap. |
