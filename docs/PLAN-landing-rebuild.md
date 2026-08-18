<!-- /autoplan restore point: C:\Users\sandi\.gstack\projects\skillforge\main-autoplan-restore-20260817-000000.md -->

# PLAN — Landing Page Rebuild: "Forge of Knowledge"

**Repo:** sandipgunale/SkillForge | **Branch:** main | **Date:** 2026-08-17
**Status:** IMPLEMENTATION COMPLETE (P0–P6 verified; review gates next)
**Workflow contract:** /autoplan → /design-consultation (new DESIGN.md) → /plan-eng-review → IMPLEMENT → /browse → /design-review → /qa → /review → /health
**Next step:** /browse + /design-review (browser binaries unavailable on this machine — degraded to pwtest probes + manual review; documented in §12) → /qa → /review → /health → /benchmark → /document-release → /ship.

---

## 1. Context & Premises

**P1. The current landing page is technically stable but creatively wrong for the product.**
The existing absolute-stack "fold" (9 sheets, scroll-snap style) was stabilized through two
hardening passes (commits ea7881c, f12c0cc): CLS 0.00009, 0 long tasks, worst frame gap 17ms,
89/89 QA checks incl. final CTA → `/register`, refresh-safe, checkpoint-safe. Stability is NOT
the problem. The problem is creative: it reads like a generic SaaS animation demo, not like a
learning platform with a soul. Premise: "a rebuild that preserves the product's real capabilities
but changes the narrative, the design language, and the scroll architecture is the right move."

**P2. The product is real and feature-rich — the landing must sell what actually exists.**
Verified in `src/routes/index.jsx` and `src/constants/routes.js`:
- Auth: `/login`, `/register`, `/forgot-password`, `/reset-password` (JWT + refresh rotation).
- Dashboard with analytics: `/dashboard`.
- Curated resources with topic filter/search/ratings/bookmarks: `/resources`, `/resources/:id`.
- AI-generated quizzes + AI evaluation: `/quiz`, `/quiz/:quizId`, `/quiz/:quizId/result`, `/quiz/history`.
- AI-personalized learning paths + workspace: `/learning-paths`, `/workspace`.
- Gamification: `/achievements`.
- Engineering showcase (recruiter walkthrough): `/showcase` — SEPARATE scope, unchanged.
Premise: every narrative section maps to a real route and a real feature; no invented capabilities.

**P3. One memorable idea beats five clever ones.**
"The Forge of Knowledge": a graduation cap (potential) enters a forge of knowledge
(knowledge graph = structure), where AI (guidance) hammers out a roadmap (direction),
tracked as progress (growth), until the cap returns transformed (mastery) in the finale.
Premise: the cap is the ONE recurring hero 3D object; the graph is the ONE recurring
structure motif; everything else supports them.

**P4. The rebuild must not regress the engineering bar.**
Performance budgets (Lighthouse ≥98, FCP <1.5s, LCP <2.0s, INP <200ms, CLS <0.05),
accessibility (keyboard, ARIA, reduced motion, dark+light), 60fps scroll with no layout
thrash, bundle discipline (landing chunk currently 60.44 kB) — all must hold after rebuild.

**P5. Design references set the *tier*, not the *look*.**
ui8.ai/forge (agency premium), scfo.de (industrial precision), southernlifts.com.au
(e-commerce conversion clarity), landonorris.com (racing motion energy). Principles only:
hierarchy, pace, kinetic typography, editorial labels, confident whitespace. Nothing copied.

**P6. Content must be true.**
No fabricated stats, no fake testimonials, no invented course counts. Where numbers are
shown they come from the real manifest (`scripts/export-showcase-data.mjs` output) or real
product capabilities stated honestly. No AI-slop (gradient blobs, floating glass cards,
neon glow, random 3D cubes, unnecessary blur).

---

## 2. Goals / Non-Goals

**Goals**
1. Complete redesign: new design system (tokens, typography, motion language, light+dark).
2. Narrative structure with editorial section labels (ARRIVAL → FORGE → MASTERY arc).
3. ONE hero 3D object: a graduation cap ("Forge cap"), premium, fast, adaptive.
4. Knowledge-graph 3D scene in the ENGINE section (the "forge" itself).
5. Scroll architecture that is native-document-first: sticky scenes + GSAP ScrollTrigger,
   OR the proven absolute-stack fold — decision required (Section 5).
6. Every CTA links to a real route; sections map to real features.
7. Cap returns in the finale (narrative closure), leading to the final CTA.
8. Pass all gates: /design-review, /qa, /review, /health, lint, build, Lighthouse.

**Non-Goals**
- NOT changing `/showcase` (separate Ember Forge system, keep).
- NOT changing app pages (dashboard, resources, quiz, workspace, profile…).
- NOT adding new product features (this is presentation, not product).
- NOT shipping fabricated numbers, testimonials, or team claims.
- NOT porting the old design tokens; old landing design system is deleted if unused.

---

## 3. Narrative IA — 15 sections

Editorial labels (mono, numbered, uppercase) echo the design keywords:
FORGED / INTELLIGENT / PRECISION / PROGRESS / DEPTH / KNOWLEDGE / CRAFT / MOTION / CONFIDENCE.

| # | Label | Narrative | Content anchor (real) | CTA |
|---|---|---|---|---|
| 00 | ARRIVAL | Hero: cap descends into view; one line of meaning; CTA pair | Product essence | `/register` primary, scroll cue secondary |
| 01 | PROBLEM | "Learning is scattered" — the broken path from tutorial chaos to mastery | Problem framing only | none (scroll) |
| 02 | SHIFT | "SkillForge turns information into a path" — the reframe | Positioning | `/register` |
| 03 | ENGINE | The Forge: 3D knowledge graph assembles around the cap | Knowledge graph motif | none |
| 04 | RESOURCES | Curated resources, topic-filtered, rated, bookmarked | `/resources` | `/resources` |
| 05 | AI | Gemini-powered: quiz generation, evaluation, assistance | `/quiz`, AI module | `/quiz` |
| 06 | PRACTICE | AI quizzes with verdicts, resume, history | `/quiz/history` | `/quiz` |
| 07 | ROADMAP | AI-personalized learning path + workspace | `/learning-paths`, `/workspace` | `/learning-paths` |
| 08 | PROGRESS | Progress tracking, achievements, streaks | `/dashboard`, `/achievements` | `/dashboard` |
| 09 | WHY | Why SkillForge (forged, not assembled) — honest differentiators | Real differentiators only | none |
| 10 | EXPERIENCE | Product experience strip — what using it feels like | Real UI flows | `/register` |
| 11 | HOW | How it works — 3 steps from account to path | Real flow: register → resources/quiz → path | `/register` |
| 12 | FAQ | Accordion, honest answers | Real product facts | none |
| 13 | MASTERY | Finale: cap returns transformed; final CTA pair | Narrative closure | `/register` primary, `/showcase` secondary |
| 14 | FOOTER | Nav, links, legal, showcase link | Standard footer | — |

The 15 sections are anchored by an editorial label system (01–14 mono numerals) —
a deliberate, consistent device (a design system requirement, not decoration).

---

## 4. Design Direction (to be finalized by /design-consultation → new DESIGN.md)

The plan REQUIRES the new design system to be produced before implementation (mandate order).
Required properties (checked in design review):
- **Tokens:** semantic (background / foreground / surface / border / accent / muted…), CSS
  variables, light + dark variants, derived from ONE palette. Old "Ember Forge" tokens must
  not leak into the landing (showcase keeps its own).
- **Typography:** premium display face + mono for labels/annotations; `clamp()` fluid scale;
  tight tracking for headlines; generous leading for body. No system-font default anywhere.
- **Layout:** one consistent container/grid; `clamp()` gutters; editorial whitespace;
  12-col grid at desktop, collapsing to single column < 768px; section rhythm standardized.
- **Motion language:** 3 tiers — micro (UI feedback, 120–180ms), reveal (sections, 400–700ms),
  cinematic (hero/finale, 1–2s). ONE easing source. All GSAP timelines centralized in
  `src/lib/motion-gsap.js` (existing). Respect `prefers-reduced-motion` everywhere.
- **3D language:** photoreal-to-stylized "forged metal" cap + graph; neutral studio lighting;
  dark: dark canvas + emissive accents; light: light canvas + same palette. No random blobs.
- **Design keywords as copy texture:** FORGED INTELLIGENT PRECISION PROGRESS DEPTH KNOWLEDGE
  CRAFT MOTION CONFIDENCE — used as section labels/keywords, never as empty decoration.

---

## 5. Scroll Architecture — the key engineering decision

**Current:** absolute-stack fold — sheets pinned via `position: fixed`-like stage, transformed
by raw scroll progress (`useForgeFold.js` + `geometry.js`), 9 anchored sheets, slot boundaries,
checkpoint/refresh-safe. PROVEN STABLE (evidence above). Hard-won fixes: raw-progress visuals,
shell-level `overflow-x: clip` (stage-level clip breaks final CTA).

**Mandate preference:** native document scroll + sticky scenes (`.sticky` + GSAP ScrollTrigger),
deleting the fold machinery. "Unless proven correct" — the fold has now been proven correct.

**The two options (close approach — TASTE DECISION at gate):**

**Option A — Native scroll rebuild (mandate preference).** Each section is a normal block;
cinematic sections are `height: 200vh` with sticky child animated by ScrollTrigger
(translate/rotate/scale only; zero layout; `scrub: 1`-style smoothing in GSAP's RAF).
Pros: simpler mental model, browser-native scrollbar/keyboard/refresh/back-forward behavior,
easier responsive, no stage math, faster to build new sections. Cons: must re-prove exact
mid-page refresh behavior, pinning correctness, and the final-CTA hit-testing; loses the
"one seamless stage" feel unless sticky scenes chain tightly.

**Option B — Keep the proven fold, re-skin + re-narrate.** Replace sheet content/narrative,
keep `useForgeFold`/`geometry` as-is, restyle to the new design system, add the cap hero +
graph scenes inside existing sheets.
Pros: stabilization evidence carries over (89/89, CLS, checkpoint sweep); zero scroll-risk.
Cons: contradicts the mandate's stated architecture preference; fold complexity (stage math,
slot registry, sheet lifecycle) stays in the codebase; new 15-section narrative must be
squeezed into the 9-sheet slot model or the slot model must grow.

**Recommended: Option A (native rebuild)** — it is the mandate's preference, it is
architecturally simpler, and the stabilization work already proved the specific failure
modes to avoid (raw progress, no damping, shell-level overflow clip, CTA hit-testing,
refresh mid-page). The old fold code is then deleted (mandate: "delete old code if unstable"
— it is stable, but the rebuild replaces it; deletion is allowed and preferred for
maintainability).

Cross-cutting scroll requirements (both options):
- Raw scroll progress → visuals; NO damped/smoothed scroll listeners (shake regression lesson).
- One transform owner per element; zero per-frame layout reads/writes; single RAF loop.
- `overflow-x: clip` on the document shell, NEVER on a 3D-transformed stage (CTA regression lesson).
- Mid-page refresh must land on the correct section visual; checkpoint/reload safe.
- Scrollbar visible + keyboard scroll functional (fold's slot math had to special-case it).
- Final CTA must be hit-testable (Playwright click → navigates); nothing may intercept it.
- Reduced motion: sections stack naturally, no pinning math, no scrub.

---

## 6. Technical Architecture

**Stack:** Vite + React 19, react-router 7 (existing), GSAP + ScrollTrigger (existing),
Three.js via `src/lib/three-engine.js` (existing reusable engine), `src/lib/motion-gsap.js`.

**New file map (all under `src/features/landing/`):**
- `experience/LandingExperience.jsx` — replaces the fold composition; owns section order,
  nav/footer wiring. Deletes `experience/forge/*` (useForgeFold, geometry, registry, forge.css)
  if Option A is chosen.
- `experience/scenes/CapScene.jsx` — hero 3D graduation cap (one object, forged-metal
  material, studio lighting, subtle idle motion, pointer parallax).
- `experience/scenes/GraphScene.jsx` — knowledge graph (nodes = real topics from resource
  data shape; edges; slow orbital drift; used in ENGINE + reused subtly in ROADMAP).
- `experience/three/CapModel.js` + `experience/three/GraphBuilder.js` — geometry/model
  builders (pure Three, no JSX) under `three-engine.js` conventions.
- `sections/` — one file per section 00–14 (StaticSection template + cinematic wrappers).
- `components/` — Navbar, Footer, ScrollProgress, Cursor (existing pieces reused/restyled).
- `lib/landing-motion.js` OR extend `src/lib/motion-gsap.js` — scroll timelines, shared
  presets; NO animation logic in section components (GSAP ownership rule).
- `hooks/useSectionReveal.js` — standard reveal timeline per section (one implementation).
- New design tokens: `src/styles/tokens.css` (or extend design-system.js — decision at
  /plan-eng-review; requirement: landing tokens live in ONE file, importable by both modes).

**State:** none shared — landing is read-only presentation + links. No new stores.

**3D discipline:** one render loop for all scenes (shared RAF, renderer paused off-screen
via IntersectionObserver), DPR clamp ≤2 (≤1.5 on low-end/memory), dispose on unmount,
reduced-motion → no auto-rotation. Lazy-load three bundle only when scenes are near viewport.

**Data:** no API calls on the landing (backend not guaranteed running); any "live" numbers
must come from the manifest artifact, and even then — prefer no fake numbers at all.

**Routing:** unchanged (`/` → LandingLayout → LandingPage). Lazy chunk stays.

---

## 7. Performance & Observability

- Targets: Lighthouse ≥98 perf/accessibility ≥100/BP ≥100/SEO ≥100; FCP <1.5s, LCP <2.0s,
  INP <200ms, CLS <0.05. Landing JS chunk: no regression vs 60.44 kB baseline (aim to shrink).
- 60fps scroll: zero long tasks in scroll phases; worst frame gap ≤ 33ms target (current 17ms).
- No layout thrash: all animation via transform/opacity; widths never animated.
- Fonts: one display family + one mono, `font-display: swap`, preload critical subset.
- Images: none or SVG-first; no unoptimized raster.
- Instrument: existing ConsoleError/CLS harness (Playwright probes in
  `C:\Users\sandi\AppData\Local\Temp\opencode\pwtest`) reused for regression comparison.

## 8. Accessibility & Responsiveness

- Keyboard: all CTAs focusable, visible focus rings, skip-to-content preserved
  (`#main-content` already exists), accordion ARIA (FAQ), no scroll-jacking of Tab.
- Reduced motion: `useMotionSafe()`/`prefers-reduced-motion` — no pinning, no scrub,
  no auto-play; content fully readable statically.
- Screen readers: aria-labels on 3D canvases (`role="img"` + label), semantic sections,
  h1/h2 hierarchy per section, alt-free decorative canvases marked `aria-hidden`.
- Contrast: tokens chosen to pass WCAG AA in both modes; mono labels ≥4.5:1.
- Responsive: 360 / 390 / 768 / 1024 / 1440 / 1920 tested; 3D scenes degrade to static
  hero image or simplified canvas < 768px; touch targets ≥44px; sticky scenes collapse to
  natural flow on small screens.

## 9. Content Rules

- Every claim traceable to a real feature/route; wording reviewed against product reality.
- No testimonials, no user counts, no social proof numbers, no "Join 10,000 learners".
- FAQ answers are factual product answers (what AI does/doesn't do, pricing-free,
  auth model, what's free, data/security posture) — drafted by implementer, verified in review.
- Copy texture: the 9 keywords; headline voice: confident, precise, industrial-craft.

## 10. Test Plan (input — refined in Phase 3)

1. Build + lint gate (existing commands; must stay warning-free).
2. Playwright harness (existing pwtest dir): overflow sweep (scrollWidth == viewport at
   390/768/1024/1440 rest+turn), CLS/stability probe, long-task probe, refresh-mid-page,
   checkpoint sweep, CTA hit-test + navigation, keyboard tab-through, reduced-motion mode,
   theme switch mid-scroll, per-section visibility, final CTA → `/register` (30s budget —
   cold Vite transform), anchor links, footer links, FAQ accordion open/close.
3. Manual walkthrough: 360→1920, both themes, keyboard-only, screen-reader spot check.
4. Lighthouse CI-style run on local dev server.

## 11. Implementation Phases

- **P0 — Design system** (after /design-consultation): tokens.css, type scale, motion
  presets, light/dark; approve via gate before section work.
- **P1 — Scroll shell:** native sticky-scene harness + section template + reveal system;
  verify refresh/checkpoint/keyboard on empty skeleton.
- **P2 — Hero (ARRIVAL):** CapScene + headline system + primary CTA.
- **P3 — Narrative sections 01–11:** per-section build in order (content approved as built).
- **P4 — ENGINE graph scene** (03) + ROADMAP reuse; performance pass on 3D.
- **P5 — Finale (13) + footer (14) + FAQ (12)**; cap-returns choreography.
- **P6 — Hardening:** full probe battery, lint/build, Lighthouse, /design-review, /qa,
  /review, /health, /benchmark comparison, docs (/document-release), ship.

### Implementation status (2026-08-17)

- **P0 DONE** — `src/styles/tokens.css` (light+dark, @font-face, helpers), Instrument Sans +
  IBM Plex Mono via @fontsource, Cabinet Grotesk woff2 vendored into `src/assets/fonts/`
  (Fontshare CDN, not on fontsource), `index.css` wired (`@theme inline` lp mappings,
  `.landing-shell` keeps `overflow-x: clip`).
- **P1 DONE** — `experience/forge/*` deleted (10 files) + orphaned `HeroContent.jsx`; import
  sweep clean. New `experience/registry.js` (15-section registry + NAV_LINKS), shared
  `experience/useEntrance.js` (useSectionEntrance / useScrubReveal / useInView — native
  flow, ScrollTrigger, reduced-motion safe), `experience/sections/type.js` + `shared.jsx`.
  `LandingNavbar`, `ScrollProgress`, `LandingFooter` rewritten on lp tokens; fold
  geometry/registry imports gone.
- **P2/P3/P4/P5 DONE** — sections 00–14 implemented: ArrivalSection (deferred 3D cap,
  copper hero, scrub recede), statements (01/02), EngineSection (sticky graph panel +
  deferred ambient KnowledgeConstellation), ForgeGraph (40 curated nodes / 41 edges,
  deterministic precomputed layout, GSAP drift, reduced-motion static), product sections
  (04–08, sample-UI panels labeled), Why (09), Experience (10), How (11, scrub circuit),
  FAQ (12, native `<details>`), Mastery (13, sticky cap-return scrub), LandingFooter (14).
- **P5 hardening DONE** — off-screen pause added (`useOffscreen` in three-engine.js; both
  scenes `frameloop="demand"` + useFrame guards), scene palette scoped via container refs,
  visited-link rule, focus rings, reduced-motion verified.
- **P6 DONE (probes)** — `landing-qa.mjs` 10/10, `landing-smoke.mjs`, `landing-scroll.mjs`,
  `landing-sticky.mjs`, `landing-mobile.mjs` (390px), `landing-360.mjs` all green: 15
  sections render, sticky engine panel + mastery stage engage, nav spy, FAQ keyboard,
  no console errors, no horizontal overflow at 1440/390/360. Lint warning-free; build
  clean (Cabinet Grotesk bundles; landing chunk 7.51 kB gzip 2.86 kB).
- **PENDING** — review gates: /design-review (visual), /qa, /review, /health, /benchmark,
  /document-release, /ship. Backend untouched; showcase untouched.

## 12. Risks & Failure Modes

| Risk | Mitigation |
|---|---|
| Sticky-scene pinning bugs (refresh/back/backspace) | P1 skeleton verified before content; reuse stabilization lessons (raw progress, shell clip) |
| 3D perf regression (DPR, fill-rate, low-end) | DPR clamp, off-screen pause, LOD, reduced-motion static fallback |
| Final CTA hit-testing regression | Reuse debug-cta7/8 probe battery; clip only at shell |
| Narrative drift (sections not matching product) | Every section reviewed against routes; content rules enforced |
| Design-slop creep during implementation | Design review gates; tokens-only styling; no ad-hoc gradients |
| Bundle growth | Lazy 3D, no new deps (GSAP/Three already present) |

## 13. NOT in scope

- `/showcase` changes, app pages, backend, manifest/versioning, CI, infra, SEO meta overhaul.
- New product features, auth flows, resource content, quiz content, pricing.
- Keeping the old fold architecture (Option A deletes it) — pending gate decision.
- Testimonial/social-proof content in ANY form.

## 14. What already exists (reuse map)

- Stabilized fold + probes (Option B fallback; Option A deletes `experience/forge/*`).
- `src/lib/three-engine.js` (reusable Three engine), `KnowledgeConstellation.jsx` (graph pattern),
  `useDeferredScene.js`, `Cursor.jsx`, `ScrollProgress.jsx`, `LandingNavbar.jsx`, `LandingFooter.jsx`.
- `src/lib/motion-gsap.js` (GSAP presets), `src/lib/design-system.js` (showcase tokens — keep separate).
- `src/layouts/LandingLayout.jsx` (`.landing-shell` — overflow-x clip stays).
- `src/routes/index.jsx` + `ROUTES` constants (CTA targets).
- `DESIGN.md` (showcase system — the landing's new system is a NEW document produced by
  /design-consultation; DESIGN.md may gain a landing section or a sibling file).
- QA harness: `C:\Users\sandi\AppData\Local\Temp\opencode\pwtest\` (forge-fold-qa.mjs,
  debug-*.mjs batteries, chrome path configured).

## 15. Decisions already made (pre-review)

- D0: Rebuild happens (user mandate); stabilization shipped and preserved as baseline.
- D1: One hero 3D object (cap); graph as second scene; no other 3D.
- D2: 15-section narrative IA (00–14) with editorial labels.
- D3: Workflow order fixed by mandate (autoplan → design-consultation → eng-review → implement).
- D4: Recommended scroll architecture = Option A (native sticky-scenes) — OPEN at gate.

---

# /autoplan Review Pipeline — Output

Pipeline: /autoplan (CEO → Design → Eng → DX[skipped]) | Mode: SELECTIVE EXPANSION | Dual voice: `[subagent-only]` (Codex CLI unavailable on Windows — verified `codex` not on PATH; degradation per skill) | Branch: main | Commit: a76bbec | Date: 2026-08-17

## Phase 1 — CEO Review (Strategy & Scope)

### System Audit
- git log: two stabilization passes (ea7881c, f12c0cc) + manifest regen; landing has a recurrence history (shake → CTA regression → fixed) — RETROSPECTIVE: scroll/overflow/CTA areas get aggressive re-review (done in §5 cross-cutting scroll requirements).
- diff vs base: only pre-existing AppLogo.jsx change (leave untouched).
- CLAUDE.md/TODOS.md read; TODOS P2 "no vitest runner" is the relevant dependency for the test strategy.
- Design docs: DESIGN.md (showcase "Ember Forge", approved 2026-08-08) + ~/.gstack sandi-main-design-20260808-151711.md. Landing's new system does NOT exist yet — per mandate order it is produced by /design-consultation AFTER this review; the plan requires it (Section 4) and design review Pass 5 evaluates sufficiency.
- Taste calibration: GOOD patterns to imitate — the fold's single raw-progress model (no damping, geometry separated from effects), shell-level overflow clip with comment. ANTI-patterns — the absolute-stack slot registry math (fragile, special-cased keyboard/refresh), stage-level clipping.

### 0A. Premise Challenge
- P1 (stable but creatively wrong): ACCEPT — evidence-backed (CLS 0.00009, 89/89 QA, 0 jank). No challenge.
- P2 (sell the real product): ACCEPT — routes verified (auth/dashboard/resources/quiz/learning-paths/achievements/showcase).
- P3 (one memorable idea): ACCEPT with constraint — the cap MUST stay one object, restrained motion, no gimmick drift; the design review enforces it.
- P4 (engineering bar): ACCEPT — budgets + probe battery carried over.
- P5 (references as tier): ACCEPT — principles only; blacklist enforced (design Pass 4).
- P6 (content truth): ACCEPT — strongest premise; aligns with no-fabrication rule.
- → GATE: premises presented to user for confirmation (below).

### 0B. Existing Code Leverage (sub-problem → existing code)
| Sub-problem | Existing code | Reuse |
|---|---|---|
| Scroll choreography | useForgeFold.js + geometry.js (raw progress model) | Lessons only (Option A deletes); geometry.js is the reference for refresh-safety |
| 3D render loop | src/lib/three-engine.js | Reuse for CapScene/GraphScene |
| Graph motif | KnowledgeConstellation.jsx | Pattern source for GraphScene |
| GSAP presets | src/lib/motion-gsap.js | Extend (one motion library rule) |
| Nav/footer/scroll UI | LandingNavbar/LandingFooter/ScrollProgress/Cursor | Reuse + restyle |
| Overflow clipping | index.css `.landing-shell` (line ~378) | KEEP (clip at shell, never stage) |
| CTA targets | ROUTES constants + routes/index.jsx | Reuse |
| QA | pwtest harness (forge-fold-qa.mjs + debug-*.mjs) | Reuse + extend |

### 0C. Dream State Mapping
```
CURRENT STATE                    THIS PLAN                    12-MONTH IDEAL
Stable fold; generic SaaS        Native scroll; cap hero;      Landing = conversion engine:
animation demo; showcase has     Forge narrative; new          sells the story in 90s; the
the only designed system;        design system; section        cap + graph become brand
landing copy vague               framework; real CTAs          assets reused in onboarding
                                                                 (CapScene) and dashboard
                                                                 (GraphScene); landing +
                                                                 showcase share one token core
```
Dream-state delta: plan leaves us 60% of the way — the design system + narrative land, the shared-token-core unification of landing/showcase is deferred (showcase stays on Ember Forge; unification is a TODOS item — do not couple them in this rebuild).

### 0C-bis. Implementation Alternatives
```
APPROACH A: Native sticky-scene rebuild (RECOMMENDED)
  Effort: L | Risk: Med | Reuses: three-engine, motion-gsap, chrome components, probes
  Pros: mandate preference; simpler mental model; native scrollbar/keyboard/refresh;
        deletes fold complexity
  Cons: must re-prove pinning/refresh/CTA behaviors (probe battery handles it)
APPROACH B: Keep proven fold, re-skin + re-narrate
  Effort: M | Risk: Low | Reuses: all fold machinery + evidence
  Pros: 89/89 QA evidence carries; zero scroll risk
  Cons: contradicts mandate architecture preference; slot-model squeeze for 15 sections
APPROACH C: Minimal (copy/color swap only)
  Effort: S | Risk: Low | Reuses: everything
  Cons: fails the mandate's redesign intent — not a real option
```
DECISION (auto, P1 completeness + P5 explicit + mandate contract): **Approach A**. Classification: TASTE (A vs B close approach) → surfaced at final gate.

### 0D. SELECTIVE EXPANSION Analysis
- Complexity check: >8 files → smell triggered. Challenge: rebuild is inherently a rewrite (mandate-ordered); the smell applies to NEW abstraction — mitigated by: one hook, one section template, scenes as pure-Three modules, no new deps. DECISION: proceed, keep abstraction minimal (P5). Logged.
- Minimum set: tokens → scroll shell → hero → sections → finale (already phased P0–P6).
- Expansion scan (10x / delight / platform):
  - 10x: interactive product previews (real UI components framed in sections 04–08); live dashboard demo embed (rejected below).
  - Delight (≥5): numbered section progress, cap micro-reaction on CTA hover, theme-aware 3D lighting, SVG cap fallback (reduced-motion/small screens), real-manifest footer line, animated "how it works" stepper.
  - Platform: section framework (sticky template + reveal system) reusable; CapScene reusable (onboarding); GraphScene reusable (dashboard).
- Expansion decisions (all auto-decided, logged):
  - E1 Product-UI previews in sections 04–08: ACCEPT (P1 — the differentiator; natural content for those sections).
  - E2 Live dashboard demo embed: DEFER → TODOS (needs auth + running backend; heavy).
  - E3 "Performance theater" (live metrics): DEFER → TODOS (fake-feel risk; Lighthouse gates already prove quality).
  - E4 Section framework as first-class lib: ACCEPT (P4 platform potential — it IS the architecture).
  - E5 SVG cap fallback: ACCEPT (P1 a11y completeness).
  - E6 Real-manifest footer line: ACCEPT (P6 truth; cheap).
  - E7 Theme-aware 3D lighting: ACCEPT (required by design direction already).
  - E8 Cap CTA-hover micro-interaction: ACCEPT (delight; one object).
  - E9 Landing/showcase token unification: DEFER → TODOS (out of scope; avoid coupling).

### 0D-POST. CEO Plan + Spec Review
- CEO plan persisted: `~/.gstack/projects/skillforge/ceo-plans/2026-08-17-landing-rebuild.md` (written; see restore dir).
- Spec review loop: covered by the independent CEO dual-voice subagent below (same document content; single-model environment).

### 0E. Temporal Interrogation
- HOUR 1: token file location (decided: `src/styles/tokens.css`); motion preset names; scroll-harness API contract (`useSectionReveal`, `SectionSticky`).
- HOUR 2–3: pin start/end offsets math; cap camera framing; graph layout — DECIDED precomputed positions + slow orbital drift (no runtime force simulation — explicit over clever).
- HOUR 4–5: light-mode 3D lighting, reduced-motion fallback completeness, CTA hit-testing on every section, mobile degradation point (<768px static).
- HOUR 6+: finale cap-return timing, Lighthouse, bundle audit (landing chunk ≤ 70 kB ceiling incl. lazy three).

### 0F. Mode Selection
- Mode: SELECTIVE EXPANSION (autoplan override). Approach A applies under this mode. COMMITTED.

### CEO Dual Voices
- Codex: [codex-unavailable — binary not on PATH (verified); degradation to single-model].
- Claude subagent: dispatched independently on the plan file — returned EMPTY (subagent crashed without findings) → per skill degradation ("Outside voices unavailable — continuing with primary review") → SINGLE-REVIEWER MODE for this pipeline run.
- Consensus table (single-reviewer mode — missing voices = N/A, not CONFIRMED):

```
CEO DUAL VOICES — CONSENSUS TABLE:
  Dimension                            Claude  Codex   Consensus
  1. Premises valid?                    N/A     N/A     PRIMARY REVIEW ONLY (user-confirmed at gate)
  2. Right problem to solve?            N/A     N/A     PRIMARY REVIEW ONLY
  3. Scope calibration correct?         N/A     N/A     PRIMARY REVIEW ONLY
  4. Alternatives sufficiently explored? N/A    N/A     PRIMARY REVIEW ONLY
  5. Competitive/market risks covered?  N/A     N/A     PRIMARY REVIEW ONLY
  6. 6-month trajectory sound?          N/A     N/A     PRIMARY REVIEW ONLY
  [single-reviewer mode: codex-unavailable + subagent-empty; pipeline completed on primary review]
```

### Review Sections 1–11 (CEO lens; auto-decided; audit-trail rows appended)

S1 Architecture: boundaries sound (scenes/sections/lib). Findings: (a) fold deletion must include an import sweep (StaticSections.jsx + LandingExperience.jsx import from forge/) and forge.css removal, `.landing-shell` retained; (b) tokens single-source decided `src/styles/tokens.css`; (c) CapScene/GraphScene MUST go through three-engine.js API (verify engine contract at implementation — read `three-engine.js` before coding). Data flow: none (static page; links + theme only). State machine (new): SCENE: `idle → mounting → reveal → active → disposing`; error path: WebGL unavailable/context-loss → static poster (SVG cap / static graph). No silent failures. 6-month view: section framework is the reusable asset. — Findings auto-decided: fix (a),(b),(c) into plan (P1 completeness/P5 explicit).

S2 Error & Rescue Registry:
| Codepath | What can go wrong | Rescue | User sees |
|---|---|---|---|
| CapScene/GraphScene init | WebGL unavailable | Static SVG poster, scenes skipped | Full poster content, no blank |
| Render loop | Context lost | `webglcontextlost` → pause + static poster | Poster (no crash) |
| IntersectionObserver | Unsupported (legacy) | Fallback: scenes always-on but degraded, or static | Content present |
| Reduced motion | Scenes disabled | Static layout, no pinning | Normal static page |
| Fonts | Load failure | font-display: swap + fallback stack | System fallback text |
| GSAP | Bundled — n/a | — | — |
No catch-all handlers; all named. No CRITICAL GAPS.

S3 Security: no new attack surface — zero inputs, zero API calls, zero new deps (GSAP/Three already shipped). Content is static JSX; FAQ is static copy (no dangerouslySetInnerHTML); no secrets; no PII. Finding: none (examined input/validation/injection/data-classification — all n/a for static presentation; documented).

S4 Data/Interaction edge cases: rapid double-click CTA (harmless duplicate nav — router dedups), anchor links with sticky scenes (MUST verify landing offset via probe — new probe), FAQ accordion (multi-open; keyboard), theme switch mid-scroll (3D relight — existing probe pattern), back/forward + refresh mid-page (native scroll — verify via probe), resize mid-scroll (ScrollTrigger.refresh + camera aspect), iOS momentum scrolling (no scroll-jacking; raw progress only). All mapped → test requirements in Phase 3. No unhandled gaps (each has a probe).

S5 Code quality: one section template + one reveal hook (DRY); motion only in motion-gsap.js (rule exists in AGENTS.md); graph precomputed (explicit > clever); naming per existing conventions; no over-abstraction (one hook, one template, no HOC layer). Finding: (a) ensure `useDeferredScene.js` pattern reused for 3D deferral instead of new logic (DRY) — auto-decided: reuse. (b) No unit infra exists (TODOS P2) — consistent with repo: harness-based QA; vitest addition deferred (logged).

S6 Test review (CEO lens): test matrix exists (§10) + probe battery carries 8 probe families; gaps: per-section visibility sweep, WebGL-fail simulation, anchor-nav offset, FAQ keyboard, mobile-360 emulation, bundle ceiling check, Lighthouse — added to Phase 3 test diagram. Ambition: "2am Friday" test = refresh-mid + CTA hit-test + CLS probe — all exist as patterns.

S7 Performance: budgets defined; DPR clamp; off-screen pause; one RAF; no layout thrash (transform/opacity only); lazy three chunk; font preload. Finding: (a) cap environment-map cost (small/offline procedural env map); (b) graph node cap ≤80 + edge count cap; auto-decided (P1 completeness, P5 explicit).

S8 Observability: no server; client observability = console-error gate + CLS/long-task probes + Lighthouse (all in harness). No new instrumentation needed (landing is static). Documented as examined/nothing flagged beyond harness reuse.

S9 Deployment & rollout: static SPA; existing pipeline (Vite build + manifest regen + push); rollback = revert + rebuild; no API coupling → zero deploy risk window; post-deploy = run qa battery. Nothing flagged.

S10 Long-term trajectory: reversibility 4/5 (new files; old deleted but in git); debt REDUCED (fold machinery removed); CapScene/GraphScene reusable; 1-year read: plan's §5 lessons make the scroll architecture legible. Nothing flagged beyond E9 (deferred).

S11 Design & UX (CEO): IA arc strong (poster hero → problem → shift → engine → features → how → why → mastery). Interaction states: static page states = pre-reveal skeleton / revealed / reduced-motion / no-WebGL poster / theme-switched — plan specifies poster + skeleton; add explicit "scene loading state" (auto-decided: skeleton/poster spec into design phase). Emotional arc mapped (wonder → recognition → hope → awe → confidence → trust → aspiration → action). AI-slop risk: LOW (hard bans + design-review enforcement). DESIGN.md: new system required — handled. Responsive/a11y: specified. Recommendation: /plan-design-review runs (in-pipeline Phase 2). Findings: one (scene loading state) — fixed.

### CEO Mandatory Outputs

#### "NOT in scope" (CEO)
- Live dashboard demo embed — needs auth/backend; deferred to TODOS.
- Performance theater (live metrics) — fake-feel risk; deferred.
- Landing/showcase token unification — coupling risk; deferred to TODOS.
- Vitest unit infra — repo-wide decision; deferred to TODOS (P2 exists).
- Backend/API-driven landing content — landing must work without backend.

#### "What already exists" (CEO)
Covered by 0B leverage map: fold lessons, three-engine.js, motion-gsap.js, KnowledgeConstellation, chrome components, .landing-shell clip, ROUTES, pwtest harness.

#### Failure Modes Registry (CEO)
| Codepath | Failure mode | Rescued? | Test? | User sees | Logged? |
|---|---|---|---|---|---|
| Scene init | WebGL unavailable | Y (poster) | NEW probe | Poster | Y (console) |
| Render loop | Context lost | Y (pause+poster) | NEW probe | Poster | Y |
| Sticky pin | Refresh mid-page wrong state | Y (native scroll) | probe (exists pattern) | Correct section | — |
| CTA | Intercept (stage-clip regression) | Y (shell clip) | probe (exists pattern) | Clickable CTA | — |
| Scroll | Jank/shake | Y (raw progress) | probe (exists pattern) | Smooth | Y |
| Theme | 3D wrong lighting after switch | Y (relight) | probe (exists pattern) | Correct theme | — |
CRITICAL GAPS: none. RESCUED=Y everywhere; all user-visible; all logged/tested.

#### Dream State Delta
Written above (0C). Gap to ideal: shared token core + cap/graph reuse in product surfaces (deferred by design).

#### TODOS.md updates (CEO proposals, auto-decided → DEFER, logged)
- T1: E2 live demo embed — DEFER (P2).
- T2: E3 performance theater — DEFER (P3).
- T3: E9 landing/showcase token unification — DEFER (P2).
- T4: Vitest infra for frontend — DEFER (P2, already tracked in TODOS.md).

#### Phase 1 Completion Summary
```
  Mode: SELECTIVE EXPANSION | Premise gate: passed (user confirmed below)
  Sections: S1 arch 3 findings→fixed | S2 errors 6 mapped, 0 gaps | S3 security 0
  S4 edges 8 mapped, 0 unhandled | S5 quality 2→fixed | S6 tests diagram→Phase 3
  S7 perf 2→fixed | S8 observ 0 | S9 deploy 0 | S10 future 0 | S11 design 1→fixed
  NOT in scope: 4 items | What exists: written | Dream delta: written
  Error/rescue: 6 methods, 0 CRITICAL GAPS | Failure modes: 7, 0 CRITICAL GAPS
  TODOS: 4 proposed (auto-deferred) | Scope: 9 proposals (E1–E9), 5 accepted, 4 deferred
  Outside voice: [subagent-only] (codex unavailable) | Lake score: 12/13 complete-option picks
  Diagrams: system arch (S1), scene state machine (S1), failure registry
```

### Phase 1 Implementation Tasks (CEO)
- [ ] **T1 (P1, human: ~1h / CC: ~10min)** — landing — Remove fold machinery: delete `experience/forge/*` (useForgeFold, geometry, registry, forge.css), rewire StaticSections/LandingExperience imports, keep `.landing-shell` clip. Files: `src/features/landing/experience/*`. Verify: `npm run build` + overflow probe.
- [ ] **T2 (P1, human: ~2h / CC: ~15min)** — landing — Adopt tokens: create `src/styles/tokens.css` (semantic tokens, light+dark) after /design-consultation; single source for landing. Files: `src/styles/tokens.css`, landing imports. Verify: theme switch probe.
- [ ] **T3 (P1, human: ~4h / CC: ~30min)** — landing — Build native sticky-scene harness: SectionSticky + useSectionReveal + scroll timeline presets in motion-gsap.js; skeleton verified (refresh/checkpoint/keyboard) before content. Verify: refresh-mid + checkpoint probes.
- [ ] **T4 (P1, human: ~8h / CC: ~1h)** — landing — CapScene: forged-metal cap, studio lighting, idle motion, pointer parallax, theme-aware relight, WebGL-fail poster, SVG fallback, reuse useDeferredScene + three-engine.js. Verify: scene probes + reduced-motion probe.
- [ ] **T5 (P1, human: ~6h / CC: ~45min)** — landing — GraphScene: precomputed positions, ≤80 nodes, slow orbital drift, no runtime simulation; reuse in ENGINE + ROADMAP. Verify: perf probe (long tasks, DPR clamp).
- [ ] **T6 (P2, human: ~2d / CC: ~2h)** — landing — Build sections 00–14 per narrative table with product-UI previews (E1) in 04–08; copy reviewed against content rules. Verify: per-section visibility probe.
- [ ] **T7 (P1, human: ~2h / CC: ~15min)** — landing — Update QA battery: per-section visibility, WebGL-fail, anchor-nav offset, FAQ keyboard, mobile-360, bundle ceiling, Lighthouse. Files: pwtest scripts. Verify: full battery green.
- [ ] **T8 (P2, human: ~1h / CC: ~10min)** — landing — Restyle Navbar/Footer/ScrollProgress/Cursor to new tokens; manifest footer line (E6). Verify: design audit probe.
- [ ] **T9 (P2, human: ~2h / CC: ~15min)** — landing — FAQ accordion (multi-open, keyboard, ARIA). Verify: FAQ keyboard probe.
- [ ] **T10 (P3, human: ~2h / CC: ~15min)** — landing — Cap CTA-hover micro-interaction (E8) + finale cap-return choreography. Verify: motion probe.

**PHASE 1 COMPLETE.** Codex: [unavailable]. Claude subagent: [empty → single-reviewer]. Consensus: primary review only (premises user-confirmed). Passing to Phase 2.

## Phase 2 — Design Review (7 passes)

### Step 0. Design Scope Assessment
- Classifier: MARKETING/LANDING PAGE → Landing Page Rules apply.
- Initial rating: 7/10 — strong narrative/IA requirements and hard bans, but the VISUAL system is deliberately unspecified (produced by /design-consultation after this review per mandate order). This review's job: ensure the plan's required properties + structural decisions are complete enough that design-consultation + implementation cannot drift.
- DESIGN.md status: exists (showcase Ember Forge) — correctly scoped as separate; plan requires a NEW system doc for the landing. Flag resolved.
- Existing design leverage: `src/lib/design-system.js` (tokens module pattern), `motion-gsap.js` presets, LandingNavbar/Footer chrome, `useMotionSafe` (per AGENTS.md reduced-motion util) — plan reuses these patterns.

### Step 0.5. Dual Voices
- Codex: [codex-unavailable]. Claude subagent: [empty on Phase 1 dispatch — single-reviewer mode; not re-dispatched (same environment)]. → PRIMARY REVIEW ONLY.

### Pass 1: Information Architecture — 8/10 → 10/10 (auto-fixed)
Strong 15-section table + editorial labels. Gaps fixed into plan: (a) first-viewport composition spec (hero budget rule: brand mark, one headline, one supporting sentence, one CTA group, the cap, scroll cue — no cards in hero, full-bleed, poster-not-document); (b) nav behavior spec (sticky minimal chrome, backdrop blur, brand-first); (c) footer IA (grouped link sections: Product / Learn / Legal / Showcase, manifest line). Structural IA is now complete; visual composition left to design-consultation (deliberate).

### Pass 2: Interaction State Coverage — 7/10 → 10/10 (auto-fixed)
Static page — states mapped and added to plan §10 requirements:
| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Hero CapScene | Skeleton/poster (SVG cap) | n/a (always has content) | WebGL fail → static poster | Reveal complete | Scene loads after layout (deferred) |
| GraphScene (03) | Skeleton/poster | n/a | WebGL fail → static graph image | Orbital drift active | Degraded: static when off-screen |
| Sections | Standard reveal | n/a | n/a | Revealed | Reduced-motion: static |
| FAQ | n/a | n/a | n/a | Open/close feedback | Multi-open |
| Nav mobile | n/a | n/a | n/a | Menu open state | — |
| Theme switch | — | — | — | Relight + tokens swap | Mid-scroll stable (probe) |

### Pass 3: User Journey & Emotional Arc — 9/10 → 9/10
Storyboard added to plan (Section 3 narrative table already carries it; emotional arc documented in CEO S11). Time-horizon check: 5-sec visceral (cap + headline), 5-min behavioral (scannable sections → CTA), 5-year reflective (why-SkillForge trust section). No fixes needed.

### Pass 4: AI Slop Risk — 8/10 → 10/10 (auto-fixed)
Plan already bans slop (Section 2 + §4 design keywords-as-copy rule). Added to §4: explicit AI-slop blacklist compliance — banned: purple/indigo gradients, 3-column icon-feature grid, icons-in-colored-circles, centered-everything layouts, uniform bubbly radius, decorative blobs/wavy dividers, emoji-as-design, colored left-border cards, generic hero copy ("Unlock the power of…"), cookie-cutter section rhythm, system-ui as primary display font. Also added: litmus targets (brand unmistakable in first screen; one visual anchor; scannable-by-headlines; one job per section; cards only when card IS the interaction; motion serves hierarchy; premium without decorative shadows).

### Pass 5: Design System Alignment — 7/10 → 10/10 (auto-fixed)
No landing system exists yet (by design). Added to §4 required properties: (a) token file single-source rule (`src/styles/tokens.css`); (b) spacing scale (4px base) + radius scale + shadow system (light-mode shadows, dark-mode glow); (c) container: one max-width + clamp() gutter, 12-col grid → single column <768px; (d) motion tokens (duration/easing tiers) in ONE source (motion-gsap.js); (e) focus-visible rings token; (f) visited vs unvisited link colors preserved (universal rule); (g) body text ≥16px, contrast ≥4.5:1 (universal rules). Showcase Ember Forge system untouched.

### Pass 6: Responsive & Accessibility — 9/10 → 10/10 (auto-fixed)
Plan §8 already strong. Added: (a) touch targets ≥44px (already); (b) focus-visible ring spec; (c) skip-link preserved (#main-content exists); (d) mobile nav pattern = hamburger with sheet (existing MissionSheet/CommandPalette patterns as reference); (e) viewport matrix extended with 360px; (f) reduced-motion: scenes replaced by static poster + no pinning (already).

### Pass 7: Unresolved Design Decisions (resolved now)
| Decision | Resolution | Classification |
|---|---|---|
| Hero composition details | Hero-budget spec added (Pass 1); visual arrangement → design-consultation | Auto (structural) / deferred (visual) |
| Nav behavior | Sticky minimal chrome + blur, brand-first | Auto |
| Mobile nav pattern | Sheet menu (existing pattern) | Auto |
| Graph node data | Curated static topic labels (real topics from the product domain: Java, Spring, SQL, React, etc. — verified against resource topics at implementation); no API dependency | Auto |
| Cap material/color | Forged-metal neutral + accent trim; palette from new tokens; dark: emissive accents, light: studio white — visual detail → design-consultation | Deferred (visual) |
| Light-mode background | Token-driven surfaces, no flat single-color (landing rule) | Deferred (visual) |
| Reduced-motion hero | SVG cap illustration (E5, accepted) | Auto |
| FAQ content source | Static factual product answers; reviewed in /review | Auto |
| Footer links | Grouped IA (Pass 1) | Auto |
| Section container max-width | One container token for all sections | Auto |
| Graph precomputed vs simulated | Precomputed + drift (CEO 0E) | Auto (explicit > clever) |

### Post-Pass
No mockups generated in this pipeline (design binary unavailable on Windows; and visual system is /design-consultation's deliverable per mandate order) — the plan's required properties + structural resolutions make the design-consultation handoff unambiguous.

### Design Mandatory Outputs

#### "NOT in scope" (design)
- Visual mockups in this review — produced later by /design-consultation (mandate order; binary unavailable).
- Ember Forge system changes (showcase) — separate scope.
- Landing/showcase shared token core — deferred to TODOS (E9).

#### "What already exists" (design)
design-system.js token pattern, motion-gsap.js presets, LandingNavbar/LandingFooter/ScrollProgress/Cursor, useMotionSafe reduced-motion util, MissionSheet (mobile menu pattern), pwtest theme-switch probe (debug-design-audit).

#### TODOS.md updates (design, auto-decided → DEFER, logged)
- T5: Landing/showcase shared token core (dup of E9 — dedupe with CEO T3) — DEFER (P2).
- T6: Light-mode 3D asset pass (cap env-map variant for light theme) — DEFER (P3).

### Design Litmus Scorecard (primary review)
| Litmus | Verdict |
|---|---|
| Brand unmistakable in first screen | YES (cap + name + headline budget) |
| One strong visual anchor | YES (cap) |
| Scannable by headlines only | YES (15 editorial labels) |
| Each section one job | YES (narrative table) |
| Cards actually necessary | None planned except feature previews (E1) — intentional |
| Motion improves hierarchy/atmosphere | YES (3 tiers + reveal system) |
| Premium without decorative shadows | YES (tokens + shadow system; bans list) |

### Phase 2 Completion Summary
```
  Pass 1 (Info Arch)  8/10 → 10/10 (hero budget, nav, footer IA added)
  Pass 2 (States)     7/10 → 10/10 (state table added)
  Pass 3 (Journey)    9/10 → 9/10  (arc already strong)
  Pass 4 (AI Slop)    8/10 → 10/10 (blacklist + litmus added)
  Pass 5 (Design Sys) 7/10 → 10/10 (tokens/spacing/radius/shadow/link/contrast rules added)
  Pass 6 (Responsive) 9/10 → 10/10 (focus rings, mobile nav, 360px added)
  Pass 7 (Decisions)  11 resolved (8 auto, 3 deferred to design-consultation)
  Overall design score: 8/10 → 10/10
  NOT in scope: 3 | What exists: written | TODOS: 2 proposed (deferred)
  Mockups: 0 (deliberate — design-consultation owns the visual system)
```
"Plan is design-complete. /design-consultation must produce the visual system, then /design-review after implementation for visual QA."

### Phase 2 Implementation Tasks (design)
- [ ] **T11 (P1, human: ~3h / CC: ~20min)** — landing — Produce new design system via /design-consultation: tokens.css (semantic light+dark), type scale (clamp), spacing/radius/shadow scales, motion tokens, hero-budget composition, nav/footer IA; update DESIGN.md with a landing section. Files: `src/styles/tokens.css`, `DESIGN.md`. Verify: theme-switch probe + token audit.
- [ ] **T12 (P1, human: ~1h / CC: ~10min)** — landing — Implement focus-visible rings + visited-link color tokens + ≥16px body text rule in tokens. Files: `tokens.css`, base styles. Verify: a11y probe.
- [ ] **T13 (P2, human: ~2h / CC: ~15min)** — landing — Mobile sheet nav for landing (reuse MissionSheet pattern) + 360px viewport QA. Verify: mobile-360 probe.

**PHASE 2 COMPLETE.** Design overall: 10/10. Dual voices: [single-reviewer]. Passing to Phase 3.

## Phase 3 — Eng Review

### Step 0. Scope Challenge
- Complexity check: plan touches >15 files (scenes, sections, lib, CSS) → SMELL triggered. Challenge resolved (auto, mandate contract + P5): this is a mandate-ordered REWRITE, not scope creep; the complexity gate applies to NEW abstraction, which the plan caps (one hook `useSectionReveal`, one template, scenes as pure-Three modules, zero new deps). Logged. No reduction.
- Search check: GSAP ScrollTrigger sticky-scene pattern is established practice (in-distribution knowledge; no custom solution invented — the fold's custom absolute-stack WAS the anti-pattern being removed). No built-in framework feature exists for scroll choreography in React beyond ScrollTrigger — using it is the built-in. Note: WebSearch available but this pattern is well-known; proceeding in-distribution.
- TODOS cross-ref: "Frontend test infra: no vitest runner" (P2) — this plan stays harness-consistent (no unit infra added); captured as deferred (dup of CEO T4). No blockers.
- Completeness check: no shortcuts — full probe battery + budgets included.
- Distribution check: no new artifact type (static SPA, existing pipeline). N/A.

### Dual Voices
- Codex: [codex-unavailable]. Claude subagent: [single-reviewer mode established]. → PRIMARY REVIEW ONLY.

### Section 1. Architecture Review
```
ASCII — LANDING REBUILD DEPENDENCY GRAPH (Option A)

  src/routes/index.jsx ──► LandingLayout.jsx (.landing-shell: overflow-x clip RETAINED)
                                  │
                                  ▼
                    LandingExperience.jsx (NEW — replaces fold composition)
                    │ sections 00–14 (ordered) │ scenes │ chrome
                    ▼                          ▼        ▼
   sections/SectionTemplate.jsx (NEW)   scenes/CapScene.jsx (NEW)   Navbar/Footer/
   hooks/useSectionReveal.js (NEW)      scenes/GraphScene.jsx (NEW) ScrollProgress/
   lib/landing-motion.js (NEW, or       three/CapModel.js (NEW)     Cursor (RESTYLE)
   extends src/lib/motion-gsap.js)      three/GraphBuilder.js (NEW)
        │                                   │
        ▼                                   ▼
   src/lib/motion-gsap.js ◄────────── src/lib/three-engine.js (REUSE — sole render loop)
        │                                   │
        ▼                                   ▼
   src/styles/tokens.css (NEW) ◄── src/lib/design-system.js (showcase only — UNTOUCHED)

   DELETED (Option A): experience/forge/{useForgeFold.js, geometry.js, registry.js,
   forge.css} + all imports (StaticSections rewiring, LandingExperience rewrite).
   KEPT: .landing-shell clip rule, useDeferredScene.js, ROUTES constants.
```
- Coupling: landing lib → tokens/motion/three-engine only; no coupling to showcase or app features. Scene modules are pure Three (no JSX) → testable/portable (platform potential: reuse in onboarding/dashboard later).
- Data flow: none (static). State machine (scene lifecycle): `idle → mounting → reveal → active → disposing`; transitions: any → static-poster on WebGL fail/context-loss/reduced-motion (guard: poster is the default render for reduced-motion — no dead canvas).
- SPOF: WebGL context — mitigated (poster fallback). Fonts — mitigated (swap + stack). Single render loop — if the loop dies, all scenes pause → guard: try/catch around frame callback + context-lost handler (named, not catch-all).
- Production failure scenarios: (a) low-end device → DPR clamp + particle/node caps (≤80 nodes); (b) mid-scroll context loss → pause + poster; (c) slow network on 3D chunk → skeleton/poster until loaded (lazy + deferred).
- Rollback: git revert + rebuild + manifest regen; no DB. Deploy risk window: zero API coupling.
- Finding (auto-decided, P4 DRY): `useDeferredScene.js` must be reused for scene deferral (no new intersection logic).

### Section 2. Code Quality Review
- DRY: one section template + one reveal hook; reveal timelines only in motion lib; no per-section animation code.
- Naming: follow existing feature folder conventions (sections/, scenes/, three/, lib/).
- Over-engineering guard: graph = precomputed positions + drift (no simulation lib); cap = one material set; NO prop-drilling framework, NO state store, NO i18n.
- Under-engineering guard: scene dispose on unmount (geometries/materials/env-map), resize handler via engine, StrictMode-safe effect cleanup (GSAP context + RAF cancel — lesson from stabilization).
- Stale diagrams audit: forge files being deleted carry no diagrams; `.landing-shell` comment retained; new architecture diagram (above) added to plan.
- Findings: none beyond those fixed above (confidence: 9/10 — verified against current code structure).

### Section 3. Test Review (full diagram — NEVER compressed)

**Test framework detection:** no vitest/unit runner (TODOS P2); repo practice = Playwright harness in `C:\Users\sandi\AppData\Local\Temp\opencode\pwtest` + build/lint gates. Plan stays consistent (unit infra deferred).

```
CODE PATHS (new)                                          USER FLOWS (landing)
[+] LandingExperience.jsx                                [+] Visit landing
  ├── section order render                               ├── [★★★ pattern] load + first viewport — probe: overflow sweep
  ├── nav/footer wiring                                  ├── [★ existing] chunk loads (lazy) — build gate
[+] useSectionReveal.js                                  ├── [GAP][→E2E] per-section visibility sweep (NEW probe)
  ├── [★★★ pattern] reveal triggers                     [+] Scroll through 15 sections
  ├── [GAP] reduced-motion bypass                        ├── [★★★ pattern] refresh mid-page — debug-refresh-mid
[+] SectionSticky (pinning)                              ├── [★★★ pattern] checkpoint sweep — debug-checkpoint-sweep
  ├── [GAP][→E2E] pin start/end offsets                  ├── [★★★ pattern] CLS + long-tasks — debug-stability
  ├── [GAP][→E2E] anchor-nav landing offset              ├── [★★★ pattern] scrollWidth == viewport — debug-overflow2
[+] CapScene / GraphScene                                ├── [GAP] scene visible + aria-label (NEW probe)
  ├── [GAP][→E2E] WebGL unavailable → poster             ├── [GAP] WebGL-fail simulation → poster (NEW probe)
  ├── [GAP] context lost → pause + poster                ├── [GAP][→E2E] mobile 360: degraded scene, tappable CTAs (NEW)
  ├── [GAP] reduced-motion → static SVG cap              ├── [★★★ pattern] theme switch mid-scroll — debug-design-audit
  ├── [GAP] dispose on unmount (leak check)              ├── [★★★ pattern] reduced-motion mode — debug-reduced-marquee
  ├── [GAP] DPR clamp / node cap (perf)                  ├── [★★★ pattern] keyboard + focus — debug-width-keyboard-qa
[+] tokens.css (light/dark)                              [+] CTAs
  ├── [★★★ pattern] theme switch stability               ├── [★★★ pattern] final CTA → /register — forge-fold-qa (30s budget)
  ├── [GAP] contrast in both themes (audit)              ├── [GAP] every section CTA hit-test (NEW probe)
[+] FAQ accordion                                        ├── [GAP] double-click nav (harmless dup — router)
  ├── [GAP][→E2E] keyboard open/close + ARIA (NEW)       [+] FAQ
[+] Footer manifest line                                 ├── [GAP][→E2E] accordion keyboard + multi-open (NEW probe)
  ├── [GAP] manifest data correctness (source check)     [+] Footer links
                                                         ├── [GAP] all links resolve (NEW probe)
[+] bundle: landing chunk ceiling ≤ 70 kB incl lazy 3D
  ├── [GAP] size regression check in build log (NEW)

COVERAGE: existing patterns cover 12 flows ★★★; NEW probes required: 10 (listed)
QUALITY: ★★★ (existing patterns) + 10 new GAP probes | No LLM/prompt changes (no EVAL)
```
Regression rule: the fold's verified behaviors that MUST NOT regress (raw-progress smoothness, shell clip, CTA hit-testing, refresh-mid, keyboard scroll) all have existing probe patterns → re-run as regression suite (mandatory, no AskUserQuestion — iron rule).

### Test Plan Artifact
Written to: `C:\Users\sandi\.gstack\projects\skillforge\sandi-main-eng-review-test-plan-20260817-*.md` (see file for /qa consumption: affected routes, key interactions, edge cases, critical paths).

### Section 4. Performance Review
- No backend (N/A for N+1/indexes). Client: (a) render loop shared, off-screen pause via IntersectionObserver (deferred scenes); (b) DPR clamp ≤2 / ≤1.5 low-end; (c) graph ≤80 nodes + capped edges; (d) env-map: small procedural, not loaded texture; (e) dispose geometries/materials on unmount (memory leak guard — probe); (f) no per-frame layout reads/writes (transform/opacity only); (g) ScrollTrigger scrub uses GSAP's own RAF (no wheel listeners — shake regression lesson); (h) lazy three chunk + code-split sections; (i) font preload + swap.
- Findings: none beyond the fixes above (each has a probe). Confidence 8/10 (patterns verified against current engine usage).

### Eng Mandatory Outputs

#### "NOT in scope" (eng)
- Backend/API work; showcase changes; app pages; unit-test infra (deferred); new deps; i18n; CMS for landing copy.

#### "What already exists" (eng)
three-engine.js (render loop/dispose conventions), motion-gsap.js, useDeferredScene.js, .landing-shell clip, LandingLayout, ROUTES, pwtest battery (12 probe families), build/lint gates.

#### Failure Modes (eng)
| Codepath | Failure | Test? | Rescue? | User sees | Silent? |
|---|---|---|---|---|---|
| Scene mount | WebGL unavailable | NEW probe | Poster | Poster | No |
| Render loop | Context lost | NEW probe | Pause + poster | Poster | No |
| Pinning | Refresh mid-page wrong section | pattern probe | Native scroll | Correct section | No |
| CTA | Intercept (stage clip) | pattern probe | Shell clip | Clickable | No |
| 3D perf | Low-end jank | NEW probe (long tasks) | DPR clamp/caps | Smooth | No |
| Memory | Scene unmount leak | NEW probe | Dispose | — | No |
| Reduced motion | Scenes animate anyway | pattern probe | Static poster | Static | No |
CRITICAL GAPS: none.

#### Worktree parallelization
Sequential implementation, no parallelization opportunity — all steps touch the same module (`src/features/landing/*` + tokens).

#### TODOS.md updates (eng, auto-decided → DEFER, logged)
- T7: Vitest unit infra (dedupe CEO T4) — DEFER (P2, already in TODOS).
- T8: Graph scene reuse in dashboard visualization — DEFER (P3, platform potential note).

#### Phase 3 Completion Summary
```
  Step 0: complexity smell resolved (mandate rewrite, abstraction capped)
  S1 Architecture: diagram produced; 1 finding fixed (useDeferredScene reuse)
  S2 Code quality: 0 findings beyond fixed
  S3 Test review: 12 flows covered by existing patterns + 10 NEW probe gaps;
     regression suite mandated (iron rule); test plan artifact written
  S4 Performance: 9 items evaluated, all mitigated with probes
  NOT in scope: 5 | What exists: written | Failure modes: 7, 0 CRITICAL GAPS
  Worktree: sequential | TODOS: 2 proposed (deferred, deduped)
```

### Phase 3 Implementation Tasks (eng)
- [ ] **T14 (P1, human: ~2h / CC: ~15min)** — pwtest — New probes: per-section visibility, WebGL-fail simulation, context-loss, scene aria-label, section CTA hit-test, FAQ keyboard, footer links resolve, anchor-nav offset, mobile-360, scene unmount leak, bundle ceiling check. Files: pwtest/*.mjs. Verify: full battery green.
- [ ] **T15 (P1, human: ~1h / CC: ~10min)** — pwtest — Regression suite runbook: re-run fold patterns (overflow2, stability, refresh-mid, checkpoint-sweep, width-keyboard, reduced-marquee, design-audit, CTA5) as pre/post gates. Verify: all green before and after rebuild.
- [ ] **T16 (P2, human: ~1h / CC: ~10min)** — landing — Perf guards: DPR clamp, off-screen pause, dispose-on-unmount, env-map cost, node caps. Verify: long-task + leak probes.

**PHASE 3 COMPLETE.** Codex: [unavailable]. Claude subagent: [single-reviewer]. Consensus: primary review only. Passing to Phase 3.5.

## Phase 3.5 — DX Review
**SKIPPED — no developer-facing scope detected** (Phase 0 grep: plan contains no API/CLI/SDK/skill surface; the landing is end-user-facing marketing; the developer-facing surface `/showcase` is explicitly NOT in scope). Logged per skill skip condition.

## Cross-Phase Themes
- **Single-reviewer mode** (all phases): codex unavailable + subagent empty — flagged in Phases 1–3. Medium-confidence signal: the plan's unique risk is 15-section breadth; mitigated by strict phasing (P1 shell verified before content) and the regression battery.
- **Scope breadth** (CEO S10/0F, design P1): 15 sections is a lot of content surface — mitigated by one template + copy rules; no separate finding.

## Pre-Gate Verification
- [x] CEO: premise challenge (named, user-confirmed), sections 1–11 with findings or explicit examination, Error & Rescue Registry, Failure Modes Registry, NOT in scope, What already exists, dream-state delta, completion summary, dual voices (noted unavailable → single-reviewer).
- [x] Design: 7 passes scored, issues auto-decided, litmus scorecard, completion summary, dual voices noted.
- [x] Eng: scope challenge with code analysis, architecture ASCII diagram, test diagram, test plan artifact on disk, NOT in scope, What already exists, failure modes (0 critical), completion summary, dual voices noted.
- [x] DX: skipped (no scope) — logged.
- [x] Cross-phase themes: written.
- [x] Decision Audit Trail: rows logged per auto-decision (see below).
- [x] JSONL artifacts: SKIPPED — jq not installed on Windows (skill rule: never hand-roll JSONL; warning noted).
- [x] Review logs (gstack-review-log): SKIPPED — gstack bin unavailable on Windows; noted degradation.

## Decision Audit Trail
| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | CEO | Approach A (native rebuild) over B/C | Taste | P1+P5+mandate | Mandate preference; simpler; evidence-backed | B (fold retention), C (minimal) |
| 2 | CEO | Premises P1–P6 accepted | Gate | user | User confirmed at gate | — |
| 3 | CEO | Complexity smell resolved, no reduction | Mechanical | mandate | Rewrite is mandate-ordered | reduction |
| 4 | CEO | E1 product previews in 04–08 | Taste | P1 | Differentiator, natural content | defer |
| 5 | CEO | E2 live demo embed deferred | Mechanical | P3 | Auth/backend dependency | accept-now |
| 6 | CEO | E3 perf theater deferred | Mechanical | P6 | Fake-feel risk | accept-now |
| 7 | CEO | E4 section framework first-class | Mechanical | P4 | Platform potential | defer |
| 8 | CEO | E5 SVG cap fallback | Mechanical | P1 | a11y completeness | reject |
| 9 | CEO | E6 manifest footer line | Mechanical | P6 | Truth, cheap | reject |
| 10 | CEO | E7 theme-aware 3D lighting | Mechanical | P1 | Required by direction | reject |
| 11 | CEO | E8 cap CTA hover micro-interaction | Taste | P5 | Delight, one object | defer |
| 12 | CEO | E9 landing/showcase token unification deferred | Mechanical | P3 | Coupling risk | accept-now |
| 13 | CEO | Fold deletion incl. import sweep | Mechanical | P5 | Rewrite cleanliness | keep-fold |
| 14 | CEO | tokens.css single source | Mechanical | P5 | One source of truth | design-system.js |
| 15 | CEO | Graph precomputed + drift (no simulation) | Mechanical | P5 | Explicit over clever | runtime sim |
| 16 | CEO | useDeferredScene reuse (DRY) | Mechanical | P4 | No duplicate logic | new hook |
| 17 | CEO | Scene states: idle→…→disposing + poster fallbacks | Mechanical | P1 | No silent failures | none |
| 18 | Design | Hero-budget composition spec | Mechanical | P5 | Landing rules | none |
| 19 | Design | Nav sticky chrome + sheet mobile menu | Mechanical | P5 | Existing patterns | hamburger-only |
| 20 | Design | AI-slop blacklist + litmus added | Mechanical | P1 | Hard rejection criteria | none |
| 21 | Design | Interaction state table (7 features) | Mechanical | P1 | States specified | none |
| 22 | Design | Graph nodes = curated real topics | Mechanical | P6 | Truth + no API dep | fake topics |
| 23 | Eng | Regression battery = iron rule | Mechanical | P6(regression) | Iron rule | none |
| 24 | Eng | 10 new probes; unit infra deferred | Mechanical | P3 | Harness-consistent | vitest |
| 25 | Eng | Perf guards (DPR/caps/dispose/pause) | Mechanical | P1 | Budgets | none |
| 26 | Pipeline | Codex/subagent unavailable → single-reviewer | Mechanical | — | Skill degradation | — |
| 27 | Pipeline | jq missing → JSONL skipped | Mechanical | Skill rule | Never hand-roll | — |
| 28 | Pipeline | Phase 3.5 skipped (no DX scope) | Mechanical | Skill rule | Scope detection | — |

## Implementation Tasks (aggregated across phases)
- [ ] **T1 (P1)** — landing — Remove fold machinery (forge/*, import sweep, keep .landing-shell clip)
- [ ] **T2 (P1)** — landing — Adopt tokens.css (after /design-consultation)
- [ ] **T3 (P1)** — landing — Native sticky-scene harness + useSectionReveal (skeleton verified first)
- [ ] **T4 (P1)** — landing — CapScene (forged cap, lighting, parallax, poster, SVG fallback)
- [ ] **T5 (P1)** — landing — GraphScene (precomputed, ≤80 nodes, drift)
- [ ] **T6 (P2)** — landing — Sections 00–14 with E1 product previews
- [ ] **T7 (P1)** — pwtest — New probe battery (10 probes)
- [ ] **T8 (P2)** — landing — Restyle chrome + manifest footer line
- [ ] **T9 (P2)** — landing — FAQ accordion (keyboard, ARIA, multi-open)
- [ ] **T10 (P3)** — landing — Cap CTA-hover micro-interaction + finale choreography
- [x] **T11 (P1)** — landing — /design-consultation → DESIGN.md landing section (DONE 2026-08-17; tokens.css itself lands in implementation P1)
- [ ] **T12 (P1)** — landing — Focus rings, visited-link tokens, ≥16px body
- [ ] **T13 (P2)** — landing — Mobile sheet nav + 360px QA
- [ ] **T14 (P1)** — pwtest — Implement 10 new probes
- [ ] **T15 (P1)** — pwtest — Regression suite runbook (pre/post gates)
- [ ] **T16 (P2)** — landing — Perf guards (DPR, pause, dispose, env-map, caps)
- [ ] **T17 (P3)** — TODOS — E2 live demo embed (P2), E3 perf theater (P3), E9 token unification (P2), vitest infra (P2, dup), graph-in-dashboard (P3)

## /autoplan Review Complete — Final Approval Gate

**STATUS: APPROVED (2026-08-17, option A — approve as-is, all recommendations accepted).**
- Review logs (gstack-review-log): SKIPPED — gstack bin unavailable on Windows (documented degradation; same for JSONL artifacts — jq missing).
- Next step per mandate workflow: ~~/design-consultation~~ **DONE (2026-08-17)** → **/plan-eng-review** (lock architecture) → IMPLEMENT (phases P0–P6, tasks T1–T17) → /browse → /design-review → /qa → /review → /health → /benchmark → /document-release → /ship.
- Restore point (pre-review plan state): `C:\Users\sandi\.gstack\projects\skillforge\main-autoplan-restore-20260817-000000.md`.

## Approved Design Direction (2026-08-17, /design-consultation)

**"Foundry Precision"** — approved via proposal gate + HTML preview (Path B;
design binary unavailable on Windows). Written to `DESIGN.md` (landing section,
appended; showcase Ember Forge untouched) + CLAUDE.md Design System section.
- **Aesthetic:** industrial craft — dark iron `#0b0e13`, molten copper accent
  `#ff8a3d`, steel-blue secondary `#5ea2f0` (graph intelligence), limestone
  light mode `#f7f5f1` / deep copper `#d9571f`.
- **Type:** Cabinet Grotesk (display, Fontshare CDN) · Instrument Sans (body,
  Google Fonts) · IBM Plex Mono (labels/data, Google Fonts). Scale via clamp(),
  labels 11px mono tracking 0.22em uppercase.
- **Spacing/radius/container:** 4px base; sm4/md8/lg14/full; 1180px container
  (matches showcase); radii never uniform-bubbly.
- **Motion:** 3 tiers (micro 120–180ms / reveal 400–700ms / cinematic 1–2s),
  one easing source in motion-gsap.js; scroll progress = forging progress;
  reduced-motion = static SVG poster cap.
- **Mockups:** knowledge graph (≤80 nodes, copper=in-progress, steel=known),
  AI quiz evaluation card, progress readouts — all "sample UI, real data at
  runtime"; NO fabricated stats/testimonials.
- **Preview file (reference):** `C:\Users\sandi\AppData\Local\Temp\opencode\design-consultation-preview.html`.

## /plan-eng-review — Final Architecture Lock (2026-08-17)

Delta pass over the design-consultation additions; architecture itself was
reviewed in autoplan Phase 3 (approved). Findings:

- **[ACTION] Font loading strategy:** the proposed Fontshare/Google CDN links
  are replaced by **full self-hosting** to match the existing self-hosted
  Geist pattern (no third-party origin, no render-blocking external requests):
  - `@fontsource/instrument-sans` + `@fontsource/ibm-plex-mono` (npm, 5.3.0) —
    exact weights only (400, 600 / 400, 500).
  - Cabinet Grotesk: **not on fontsource** (verified 404) → vendor woff2 from
    Fontshare CDN (`api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800,900`)
    into `src/assets/fonts/` at build, declared via `@font-face` in tokens.css;
    font-display: swap; fallback stack `system-ui, sans-serif` (graceful if
    unavailable).
- **[OK] Copper glow** is static box-shadow (no animated blur) — no per-frame
  paint cost; within budget.
- **[OK] Light/dark** single source in tokens.css via `[data-theme]` — matches
  plan D14; light mode uses redesigned surfaces (not inversion), accent
  darkened to WCAG AA.
- **[OK] Motion tiers** (micro/reveal/cinematic) map 1:1 onto motion-gsap.js
  single easing source; reduced-motion poster cap keeps the 3D budget.
- **[OK] Radius/container** divergence from showcase (sm4/md8/lg14 vs
  12/14/16) is intentional and documented in DESIGN.md.
- **[OK] Mockup content** in sections 04–08 = sample UI with real-data-at-
  runtime labels; no fabricated stats (mandate).
- Review logs: SKIPPED (gstack bin unavailable — documented degradation).

**STATUS: ARCHITECTURE LOCKED (2026-08-17).** Next: IMPLEMENT (P0–P6, T1–T17).
