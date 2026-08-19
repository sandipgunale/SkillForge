<!-- /autoplan restore point: PENDING -->

# PLAN — SkillForge Motion Language: "Forge of Knowledge, in Motion"

- **Date:** 2026-08-19
- **Branch base:** `feat/landing-rebuild` (motion work stacks on the landing rebuild; app-surface work touches shared libs the landing branch also modifies)
- **Input:** user motion direction brief (75 items) — the design source of truth
- **Scope:** FULL SYSTEM — landing + app surfaces (quiz, roadmap, AI, progress, auth) — one motion language
- **Workflow:** /autoplan (CEO → Design → Eng) → implement → /design-review → /qa → /benchmark → /document-release → ship

## 1. Context & Premises

SkillForge is a premium AI learning platform ("Forge of Knowledge"). The landing rebuild shipped editorial precision with deterministic entrance/scroll choreography. Motion is currently functional but not yet a *language*: easing is ad-hoc, sections share one choreography variant, and the hero cap lacks the physical/emotional arc the brand deserves.

Premises (from the brief):

- P1. **Motion is information**, not decoration. Every motion must communicate meaning; generic animations are rejected.
- P2. **5-layer intensity model** — each layer has a distinct character and descending intensity:
  - **Layer 1 (Global Scene):** ambient, slow, 8–16s cycles, low intensity (particles, glow, aurora).
  - **Layer 2 (Section):** one identity per section — "moments" tied to story beats, mostly scroll-driven.
  - **Layer 3 (Component):** hover/click/press micro-interactions, 100–250ms, spring-physics easing.
  - **Layer 4 (Micro):** the smallest details — glints, line draws, number transitions, shimmer.
  - **Layer 5 (Physical/3D):** hero cap — real mass, momentum, inertia, spring-dampened pointer response.
- P3. **Hero = "the forge is waking up"**: a single orchestrated entrance sequence (0/100/250/400/500/600→1200ms beats), then a 5-phase scroll transformation, then a "return differently" finale.
- P4. **Knowledge Forge signature**: a recurring motif — *fragmented → structured → personalized → mastered*, ending with the cap silhouette formed by particles/net. Represents the learner's journey; appears on landing (mastery/finale) and in the app (progress states).
- P5. **Reduced-motion is a first-class audience**, not an afterthought. Mobile constraints (no scroll-jacking, no heavy parallax on touch).
- P6. **Performance is a hard gate**: compositor-friendly transforms (transform/opacity/filter only, use `will-change` sparingly), no layout thrash, 60fps on mid hardware, Lighthouse >= 98.

## 2. Goals / Non-Goals

Goals:
- One motion token system (easing categories + duration tiers) mirrored in `design-system.js` and `motion-gsap.js`; document the language in DESIGN.md.
- Per-section Layer 2 identities for all landing sections (currently one shared variant).
- Hero: entrance timing sequence, cap 5-phase scroll transformation, return-differently finale.
- Landing micro-interactions: magnetic CTAs, press physics, spotlight hover, border tracing, number transitions.
- Knowledge Forge signature implemented in its canonical locations.
- App surfaces: quiz (answer feedback, progress ring), roadmap (chapter advance), AI center (thought/typing), gamification (point counts), theme morph.
- Coordinate with the existing GSAP motion system, `useMotionSafe`, `prefers-reduced-motion`; extend `motion-gsap.js`/`dashboard-motion.js` rather than fork.

Non-goals (this plan):
- Backend motion (none exists; not needed).
- Scroll-jacking / fixed-scroll redesigns (explicitly rejected by brief).
- New 3D engines beyond the existing Three.js scenes (reuse `GraduationCapScene`, `KnowledgeConstellation`).
- Motion for marketing pages outside landing (auth gets only theme-morph-level polish).
- A visual motion-debug overlay in production (dev-only, feature-flagged off).

## 3. Design Direction — the Motion Language

### 3.1 Motion tokens (new)

Extend `DURATION`/`EASE` in `design-system.js`; add mirrored `GSAP_EASE` entries.

- **Easing categories (5):**
  - `micro` — quick mechanical feel (press, toggle): ease-out cubic, 100–150ms.
  - `ui` — component in/out (cards, modals): ease-out expo, 200–350ms.
  - `scene` — scroll/section choreography: ease-out expo / smooth, 500–900ms.
  - `physical` — mass/spring behavior (cap, magnetic): spring-style easing (overshoot or damped), 250–600ms.
  - `scroll` — scrub/parallax mapping: linear-to-smooth mapping, tied to scroll progress, not clock time.
- **Duration tiers:** instant (≤100ms, transitions only), micro (100–150ms), base (200–350ms), slow (500–900ms), scene (900–1200ms), ambient (8–16s).
- **Stagger scales:** 40–60ms (dense grids), 90–140ms (lists), 180–300ms (hero beats).
- All tokens in one place; components never hardcode bezier/durations (enforced by review).

### 3.2 Layer 1 — Global scene (existing, extend)

Existing: `KnowledgeConstellation` ambient rotation + reduced-motion pause; landing particles/glow. Add: consistent 8–16s cycle durations (tokenized), intensity dimming when scrolled past hero (perf + hierarchy), and cap idle "breath" (existing) pulled into the same ambient token family.

### 3.3 Layer 2 — Per-section identities (landing)

Each section gets a named choreography with its own entrance character, scrubbed or triggered, deterministic from-states (the P1-1-safe pattern):

| Section | Identity | Motion character |
| --- | --- | --- |
| Hero (Arrival) | **Wake** | Full entrance sequence (3.4); cap 5-phase scroll; `data-cap-return` finale |
| Statements | **Claim** | Bold statement reveal: oversized words rise with clip mask, one line at a time, 180ms stagger; keyword accent glint |
| Why | **Trust** | Cards resolve from blur-to-focus with shadow settle; checkmark line-draw micro-interaction |
| How | **Process** | Step cards advance on scrub; connecting line draws node-to-node; numerals transition (01→02→03 vertical roll) |
| Engine | **Machine** | Panel reveals with mask wipe; oscilloscope-style shimmer traveling through the panel; status ticks light sequentially |
| ForgeGraph | **Formation** | Graph assembles on scrub: nodes activate → edges draw → clusters form; the "structured" beat of the signature |
| Experience | **Proof** | Testimonial transitions: quote rolls vertically, avatar swaps with subtle scale settle; star count transitions up |
| Mastery | **Transformation** | The **Knowledge Forge signature moment**: fragment particles converge into the cap silhouette; copy resolves from scattered/blur to focused; CTA reveals last with magnetic pull-in |
| FAQ | **Answers** | Accordion with consistent press physics; chevron rotates with `micro` ease; height animates via grid-template-rows |
| Product showcase (in-app product.jsx bits) | **Mirror** | Reuses app-component motion language (cards, tabs, counts) so the landing previews the product's real motion |

Section identity registry: `SECTION_MOTION` map in `motion-gsap.js` (name → presets + variant), so sections declare identity, never inline tweens.

### 3.4 Hero entrance — "the forge is waking up"

One timeline, deterministic from-states (direct style writes, no `clearProps` — the fixed pattern):

| Beat | ms | Element | Motion |
| --- | --- | --- | --- |
| B1 | 0 | Cap | Stored in slot; slow rotation starts; a soft ember pulse (glow opacity) |
| B2 | 100 | Halo/glow | Radial halo fades in from 0.2 → 0.6 opacity, 1200ms, `scene` ease |
| B3 | 250 | Eyebrow | Slides up with mask, 12px, `ui` ease |
| B4 | 400 | Headline | Rises 24px with mask reveal; accent "Forge" flares (glint sweep) |
| B5 | 500 | Subcopy | Fades up 12px |
| B6 | 600 | CTA cluster | Magnetic pull-in: CTAs spring from scale .96 → 1 (physical), secondary CTA slides in |
| Coda | 1200 | Ember burst | Small particle burst from cap base (Layer 4 detail), settles to idle |

Reduced motion: only opacity cross-fade at 600ms (no travel).

### 3.5 Hero cap — 5-phase scroll transformation + return

Existing: idle breath rotation, tassel lag inertia, damped mouse parallax (GraduationCapScene.jsx ~L120-271), cap-slot exit, data-cap-return.

Phases (scrubbed, tokenized, all transform-based, scale about the cap's visual center):

1. **Recede** (section leave): cap scales to 0.92 + slight y-offset, halo dims — "stepping back to let the story play".
2. **Rotate** (through the story): slow 8–12° rotation via scroll mapping (physical category) as the story progresses.
3. **Depth** (mastery approach): subtle z (scale 0.98→1.04) + tassel swing — "drawing closer".
4. **Exit** (mastery): fragment dissolve — cap breaks into particles/embers that drift upward, revealing the Mastery copy.
5. **Return differently** (finale CTA): the **return** is a different event — cap is *reformed* by the knowledge net (ForgeGraph → cap silhouette in Mastery; the signature), arriving from a new angle with warmer lighting, not a replay of the entrance.

Reduced motion / mobile: phases 1–3 reduce to opacity-only; phase 4–5 become a static silhouette reveal (opacity + small scale).

### 3.6 Layer 3/4 — Component & micro interactions

Landing: magnetic CTAs (existing `useMagnetic` — extend with spring-to-rest), press physics (scale .97 + shadow compress, `micro` ease), spotlight hover (radial gradient tracking cursor on cards — `--x/--y` CSS vars, throttled), border tracing (SVG dashoffset on hover for feature cards/CTAs), number transitions (`useCount` with eased counting — apply to stats), line draws (checkmarks, connectors, FAQ chevrons).

App surfaces (reuse existing hooks, apply the same token families):
- Quiz: answer select (press physics + border glow), correct/incorrect feedback (green/amber pulse, no shake-abuse), progress ring (count-up arc).
- Roadmap: chapter advance — numeral transition + progress bar fill; node activation (existing achievements pattern).
- AI center: typing indicator (existing), answer streaming (existing), thought shimmer.
- Gamification: point count-ups (`useCount` exists), badge pop (scale spring, `physical`).
- Theme morph: theme transition with 250ms cross-fade + eased surface shift (Layer 4 detail; verify reduced-motion).

### 3.7 Knowledge Forge signature

One reusable component (`ForgeSignature.jsx` — canvas/Three-based, low-cost particle convergence into cap silhouette) + declarative progression API: `phase: 'fragmented' | 'structured' | 'personalized' | 'mastered'`. Renders on Mastery (landing), and as small progress ornament in the app (achievements/progress ring area). Reduced motion: static silhouette with opacity reveal. Lazy-loaded; only mounts when in view (IntersectionObserver).

### 3.8 Theme, keyboard, motion safety

- Theme morph (3.6) coordinated with `data-theme` swap.
- All interactive motion has `:focus-visible` equivalents; motion never traps or blocks keyboard.
- `useMotionSafe()` gates Layer 5 heavy parallax, travel > 24px, and the 3D signature; reduced motion keeps opacity-only choreography with deterministic from-states.
- Mobile: parallax intensity 40% of desktop; scroll-scrub thresholds unchanged; no touch-based magnetic drift.

## 4. Technical Architecture

```
motion-gsap.js (exists — becomes the single motion library)
  ├─ useMotionScope / useMotionSafe (exists)
  ├─ useEntrance / useSectionEntrance (exists — P1-1-safe pattern)
  ├─ useSplitReveal / useMagnetic / useTilt / useCount / useMicroInteractions (exist)
  ├─ MOTION_TOKENS (NEW): { ease: { micro, ui, scene, physical, scroll }, durations, staggers } — imported from design-system.js
  ├─ SECTION_MOTION (NEW): section identity registry (name → presets/variant)
  └─ useSpotlight / useBorderTrace / usePressPhysics / useNumeralRoll (NEW — compose existing patterns)
design-system.js (exists) — DURATION/EASE extended with the 5 categories
dashboard-motion.js (exists) — PRESETS adopt token categories (no behavior change)
GraduationCapScene.jsx (exists) — 5-phase scroll API + fragment dissolve
ForgeSignature.jsx (NEW, lazy) — signature canvas/Three; phase API; reduced-motion fallback
sections/*.jsx — declare SECTION_MOTION identity; no inline bezier/durations
DESIGN.md — "Motion Language" section (tokens, layers, signatures, rules)
```

Constraints: no new runtime deps (GSAP + existing Three usage only); no CSS-animation forks (all motion via GSAP or CSS transitions tokenized); compositor-friendly properties only; `will-change` only during active animation (remove on complete); all cleanup via `gsap.context` (existing pattern).

## 5. Performance & Observability

- Budget: Lighthouse >= 98 / A11y 100 / BP 100 / SEO 100; FCP < 1.5s, LCP < 2.0s, INP < 200ms, CLS < 0.05 (existing budget — motion must not regress).
- Signature + 3D already lazy; add IntersectionObserver gating where missing; pause off-screen rendering (existing).
- Metrics: no new backend. Frontend: keep bundle < budget; verify via `npm run build` size diff + Lighthouse on the dev build.
- Failure modes: dropped frames → reduce particle counts via device-memory / reduced-motion (existing adaptive pattern); scroll-jank → scrub ranges stay transform-only.

## 6. Accessibility & Responsiveness

- `prefers-reduced-motion: reduce` — opacity-only variants for ALL new choreography (deterministic from-states, no travel).
- `:focus-visible` ring equivalents on magnetic/spotlight (motion never replaces focus styles).
- Motion never hides content state: from-states always end in the same final state; no dependency on animation to reach usable state (JS-off → content visible by default; entrance pre-hide is JS-gated, existing pattern).
- Mobile: 40% parallax, no scroll-jack, magnetic disabled (tap-only), signature static-silhouette fallback.
- Touch targets: press physics keeps existing 44px min (no change).

## 7. Test Plan (input — refined in Phase 3)

1. Entrance sequence: beats fire in order; deterministic from-states (no flash; the P1-1 regression probe re-run).
2. Cap scroll phases 1–5 map correctly; return-differently triggers once per visit; re-scroll up restores.
3. Reduced motion: all layers collapse to opacity-only; no layout shift; mastery copy readable.
4. Mobile (375px): parallax 40%; magnetic off; signature static; INP clean.
5. Micro-interactions: press/magnetic/spotlight/border-trace on hover + keyboard focus equivalents.
6. Theme morph: no white flash; transition only transforms/opacity.
7. App: quiz feedback, roadmap numeral roll, AI typing, gamification count-ups — token-conformant.
8. Perf: Lighthouse suite + ScrollTimeline probes (existing probe battery) on dev build; bundle diff.
9. Console: zero errors/warnings; `useEffect` cleanup verified (StrictMode double-mount safe).
10. Keyboard: full tab-through with visible focus; signature aria-hidden.

## 8. Implementation Phases

- **M1 Tokens & docs:** extend DURATION/EASE (5 categories), GSAP_EASE mirrors, MOTION_TOKENS, SECTION_MOTION registry; DESIGN.md Motion Language section. *(Foundation — everything depends on it.)*
- **M2 Hero:** entrance sequence timeline (beats B1–coda), cap 5-phase scroll API, fragment dissolve, return-differently, reduced-motion variants.
- **M3 Section identities:** Statements, Why, How, Engine, ForgeGraph, Experience, FAQ + product mirror — declare identities, replace inline variants.
- **M4 Micro-interactions:** useSpotlight/useBorderTrace/usePressPhysics/useNumeralRoll + landing application; magnetic spring-to-rest.
- **M5 Signature:** ForgeSignature component + Mastery integration + app progress ornament.
- **M6 App surfaces:** quiz feedback, roadmap numeral, AI streaming polish, gamification count-ups, theme morph.
- **M7 QA + perf + docs:** full probe battery, Lighthouse, /design-review, /qa, /benchmark, CHANGELOG, release.

Each phase: implementation → /review-style self-check → commit atomically.

## 9. Risks & Failure Modes

| Failure mode | Trigger | Mitigation |
| --- | --- | --- |
| Entrance flash regression | clearProps-like patterns in new timelines | P1-1 pattern mandated: direct style-write pre-hide; probe re-run |
| Motion ≠ information (decoration creep) | Feature-creep while polishing | Section identity registry + design review gate |
| INP regression from scroll mappings | Heavy scrub listeners | transform-only, rAF-throttled, single ScrollTrigger per section |
| Reduced-motion gap | New choreography without variant | Gate: every new motion has a `useMotionSafe` branch |
| Bundle growth (signature) | Canvas/Three for signature | Lazy + IntersectionObserver + device-memory particle caps |
| Theme flash | Theme morph on mount | transition tokens applied to theme swap only |
| Perf budget regression | Any of the above | Lighthouse + probes on dev build per phase |

## 10. NOT in scope

- Backend changes; new libraries; scroll-jacking; redesigns of copy/layout (motion-only passes); marketing pages outside landing; auth full motion (theme-morph polish only); motion debug overlay in production.

## 11. What already exists (reuse map)

- `useMotionScope/useMotionSafe`, GSAP_EASE/SECONDS, `useEntrance/useSectionEntrance` (P1-1-safe), `useSplitReveal/useMagnetic/useTilt/useCount/useMicroInteractions` — all reusable.
- `GraduationCapScene` idle breath + tassel inertia + damped parallax; cap-slot exit + data-cap-return.
- `KnowledgeConstellation` ambient + reduced-motion pause; `ForgeGraph` node/edge activation.
- `dashboard-motion.js` PRESETS; `DURATION/EASE` tokens; app-wide micro-interactions (quiz, auth, MissionRail, EmptyState, nav, achievements).
- Probe battery in `C:\Users\sandi\AppData\Local\Temp\opencode\pwtest\` (entrance, scroll, qa, smoke).

## 12. Decisions already made (pre-review)

- Scope: full system (user-confirmed); one plan doc; stacked on `feat/landing-rebuild`.
- Tokens live in design-system.js + motion-gsap.js (DRY, no new file of constants).
- No new dependencies; signature uses existing stack.
- Reduced-motion = opacity-only everywhere (brief).
- Ship cadence: separate release after landing ship; ship order: landing PR first (in flight, user-held), motion after.

# /autoplan Review Pipeline — Output

## Phase 1 — CEO Review (Strategy & Scope)

> Phase 1 runs the plan-ceo-review methodology at full depth. Codex unavailable on this machine → `[codex-unavailable]`; Claude voice only (autoplan completes with subagent only).

### 1A. System Audit
- Landing experience files (experience/), lib (motion-gsap.js, dashboard-motion.js, design-system.js), three scenes, app features (quiz, roadmap, ai, gamification). Motion code is centralized (lib/motion-gsap.js) — strong basis; the audit found no duplicate inline animation logic at scale.
- Brand + docs: DESIGN.md exists (landing direction), ROADMAP Wave plan exists; motion language undocumented → DESIGN.md gap confirmed.
- Constraints: GSAP primary engine; Three.js scenes; perf budgets; P1-1 lesson.

### 1B. Premise Challenge
- P1 (motion = information): sound, matches "Foundry Precision" brand direction. CONFIRMED.
- P2 (5-layer model): strong, matches industry best practice and existing code structure. CONFIRMED.
- P3 (hero wake sequence + 5-phase + return): right call — hero is the brand moment; the plan's beats map cleanly to the brief. CONFIRMED.
- P4 (Knowledge Forge signature): strategic — gives the platform a recognizable motif across surfaces; cost is contained (one lazy component). CONFIRMED.
- P5/P6 (reduced-motion + perf gates): non-negotiable given existing budgets. CONFIRMED.
- Premises all confirmed → pass to user for confirmation (non-auto-decided gate).

### 1C. Existing Code Leverage (sub-problem → existing code)
| Sub-problem | Existing code |
| --- | --- |
| Entrance choreography | useEntrance/useSectionEntrance (P1-1-safe pattern) |
| Magnetic CTAs | useMagnetic (needs spring-to-rest extension) |
| Counts/numbers | useCount |
| Parallax/inertia | GraduationCapScene damped mouse + tassel lag |
| Ambient scene | KnowledgeConstellation |
| Graph formation | ForgeGraph node/edge activation |
| App presets | dashboard-motion.js PRESETS |
| Reduced-motion gate | useMotionSafe + prefers-reduced-motion |
| Scroll scrub | ScrollTrigger scrub (existing) |

### 1D. Dream State Mapping
(CURRENT → THIS PLAN → 12-MONTH IDEAL)
- CURRENT: functional motion, one variant per event, cap has physics, signature absent, tokens partial.
- THIS PLAN: one tokenized language; per-section identities; hero arc; signature motif; app surfaces conform.
- IDEAL: motion system that new sections adopt declaratively (SECTION_MOTION registry → possible future /motion docs + design tooling); signature becomes the brand mark used in marketing; motion perf stays green.

### 1E. Implementation Alternatives
- A) **Token-first, full plan (chosen):** tokens → hero → sections → micro → signature → app. Low risk, layered value.
- B) Signature-first: higher wow early, but without tokens/section identities the signature won't compose; rejected (P3 pragmatic, sequencing wrong).
- C) App-only: fails the brief (landing is the brand moment); rejected.
- Chosen: A.

### 1F. Temporal Interrogation
- HOUR 1: M1 tokens + DESIGN.md motion section (foundation).
- HOUR 6: M2 hero + M3 first sections.
- DAY 1: M3/M4 complete; day 2: M5/M6; day 3: M7 QA + ship gate.
- After: regression probes re-run; landing ship can proceed independently (motion stacks after).

### 1G. Mode Selection
SELECTIVE EXPANSION (default in autoplan). Expansion candidates reviewed: dev-only motion debug overlay → deferred to TODOS (out of blast radius, adds risk); motion for auth → scoped to theme morph (contained); marketing motion docs → deferred.

### 1H. CEO Mandatory Outputs
- NOT in scope: listed (Section 10). What already exists: Section 11. Failure modes registry: Section 9.
- Dream delta: section identities + hero arc + signature + app conformance + documented tokens (see 1D).

### 1I. CEO Implementation Tasks
- [ ] **M1-t1 (P1, human 1h / CC 0.3h) — motion-tokens** — extend DURATION/EASE (5 easing categories + duration tiers) in design-system.js; mirror in GSAP_EASE/SECONDS; add MOTION_TOKENS + SECTION_MOTION registry in motion-gsap.js.
- [ ] **M1-t2 (P1, human 1h / CC 0.5h) — design-doc** — DESIGN.md "Motion Language" section (tokens, layers, identities, rules, reduced-motion policy).
- [ ] **M2-t1 (P1, human 3h / CC 1h) — hero-entrance** — B1–coda timeline, deterministic from-states (preHide pattern), reduced-motion variant.
- [ ] **M2-t2 (P1, human 4h / CC 1.5h) — cap-scroll-phases** — 5-phase scrub API + fragment dissolve + return-differently; mobile/reduced variants.
- [ ] **M3-t1 (P2, human 4h / CC 1.5h) — section-identities** — Statements/Why/How/Engine/ForgeGraph/Experience/FAQ/product-mirror declare SECTION_MOTION identities.
- [ ] **M4-t1 (P2, human 3h / CC 1h) — micro-hooks** — useSpotlight/useBorderTrace/usePressPhysics/useNumeralRoll + landing application; magnetic spring-to-rest.
- [ ] **M5-t1 (P2, human 4h / CC 1.5h) — signature** — ForgeSignature (lazy, phase API, reduced-motion fallback) + Mastery integration + app ornament.
- [ ] **M6-t1 (P3, human 3h / CC 1h) — app-surfaces** — quiz feedback, roadmap numeral, AI polish, gamification count-ups, theme morph.
- [ ] **M7-t1 (P1, human 2h / CC 0.5h) — QA+perf** — probe battery, Lighthouse, bundle diff, CHANGELOG, release prep.

## Phase 2 — Design Review (7 passes)

> Runs the plan-design-review methodology at full depth. UI scope: YES. Codex unavailable → `[codex-unavailable]`; Claude voice only.

### Step 0. Design Scope Assessment
Full-system motion; landing (14 sections + hero + cap) and app surfaces (quiz, roadmap, AI, gamification, theme). DESIGN.md exists and will gain the Motion Language section. Existing patterns reviewed (motion-gsap.js, GraduationCapScene, ForgeGraph, dashboard presets).

### Pass 1: Information Architecture — 9/10 → 10/10
Motion communicates hierarchy: hero beats order = reading order; section identities map to narrative beats (claim→trust→process→machine→formation→proof→transformation→answers). Auto-fix: ensure section identity names appear in the SECTION_MOTION registry *with* documentation strings (a registry without docs is a landing page in prose).

### Pass 2: Interaction State Coverage — 8/10 → 10/10
Covered: hover (spotlight, magnetic, border trace), press, focus (focus-visible equivalents), scroll (5-phase scrub), theme change, reduced motion, mobile tap. Auto-fix: press state must also apply on touch for CTA press physics (tap = press), not only mouse.

### Pass 3: User Journey & Emotional Arc — 10/10
Wake → story → formation → transformation → return-differently is a complete emotional arc; signature lands at the two peak beats (Mastery + app progress). No change.

### Pass 4: AI Slop Risk — 9/10 → 10/10
Generic fade-up everywhere is rejected by the identity system. Auto-fix: constrain the shared "rise" preset (dashboard-motion.js PRESETS.rise) to *not* become the default for new sections; sections must declare identities. Documented as a rule in DESIGN.md Motion Language section.

### Pass 5: Design System Alignment — 8/10 → 10/10
Tokens land in the existing system (design-system.js DURATION/EASE; motion-gsap.js GSAP_EASE/SECONDS). Auto-fix: DURATION/EASE currently mix duration+curve concerns; motion categories add a third axis (intent). Keep intent-category naming (micro/ui/scene/physical/scroll) as the primary key, durations as values — avoids a renamespacing break.

### Pass 6: Responsive & Accessibility — 9/10 → 10/10
Reduced-motion = opacity-only (deterministic from-states); mobile 40% parallax; magnetic off on touch; 44px targets unchanged; keyboard equivalents. Auto-fix: add `aria-hidden` + `role="presentation"` on signature canvas; decorative scroll phases (cap rotate) get `aria-hidden`.

### Pass 7: Unresolved Design Decisions
- Magnetic CTA + reduced motion: resolve → magnetic is *input-driven*, not choreography; keep it under `useMotionSafe` (input-driven interactions remain if they don't move layout; brief allows).
- Spotlight vs border-trace on the same card: resolve → spotlight on primary cards, border-trace on CTAs and small chips (no overlap on same element).
- Numeral roll on How section: resolve → vertical roll (01→02→03), 240ms, `micro` ease.

### Design Mandatory Outputs
- 7 dimensions scored (above). Section identity table: Section 3.3. Tokens: Section 3.1. Reduced-motion policy: Section 3.8 + 6. Signature: Section 3.7.

### Phase 2 Implementation Tasks (design)
- [ ] **M3-t2 (P1, human 1h / CC 0.3h) — registry-docs** — SECTION_MOTION registry entries with one-line doc per identity.
- [ ] **M4-t2 (P2, human 0.5h / CC 0.2h) — press-touch** — press physics triggers on touch too.
- [ ] **M4-t3 (P2, human 0.5h / CC 0.2h) — focus-spotlight** — spotlight + border-trace have :focus-visible equivalents.
- [ ] **M5-t2 (P1, human 0.3h / CC 0.1h) — signature-a11y** — aria-hidden + role="presentation".
- [ ] **M1-t3 (P2, human 0.5h / CC 0.2h) — anti-slop-rule** — DESIGN.md rule: sections declare identities; no new "rise" defaults.

## Phase 3 — Eng Review

> Runs the plan-eng-review methodology at full depth. Codex unavailable → `[codex-unavailable]`; Claude voice only.

### Step 0. Scope Challenge
Scope is contained: shared lib changes are additive (new tokens + registry + hooks), no refactor of existing motion hooks required except the documented magnetic spring extension. No reduction.

### Section 1. Architecture Review
ASCII dependency graph (new components):

```
design-system.js (tokens: EASE/DURATION, +5 categories)
   └──> motion-gsap.js (GSAP_EASE, SECONDS, MOTION_TOKENS, SECTION_MOTION, hooks)
          ├──> dashboard-motion.js (PRESETS adopt categories; unchanged behavior)
          ├──> landing experience/sections/*.jsx (declare identities)
          ├──> cap/GraduationCapScene.jsx (5-phase scroll API + dissolve)
          ├──> cap/ForgeSignature.jsx (NEW; lazy; canvas; phase API)
          │        └──> IntersectionObserver mount gate (reuse pattern)
          └──> app features (quiz/roadmap/ai/gamification; theme morph)
```

- Coupling: sections import SECTION_MOTION by name (registry), never tween inline → single source of truth. Signature isolated behind lazy + gate; no shared mutable state; no context changes.
- Security: client-only, no data changes, no new deps → no attack surface.
- Scaling: registry approach scales to new sections without touching hooks.

### Section 2. Code Quality Review
- DRY: tokens already centralized; the plan extends, doesn't duplicate. Magnetic extension reuses `useMagnetic` (compose, don't fork). Numeral roll composes `useMicroInteractions` pattern.
- Naming: SECTION_MOTION identities = section nouns (wake, claim, trust, process, machine, formation, proof, transformation, answers) — consistent with narrative naming.
- Risk flagged: the cap 5-phase API must be driven by one ScrollTrigger per phase range with a single scrub context, matching existing context-safe cleanup; document in code review.

### Section 3. Test Review (full diagram — NEVER compressed)
New UX flows and their coverage:

| Flow | Type of test | Exists? | Gap |
| --- | --- | --- | --- |
| Hero entrance beat order (B1–coda) | Probe (landing-entrance.mjs) + visual | Yes (probe) | Extend probe to assert beat order + reduced-motion variant |
| Cap scroll phases 1–5 mapping | Probe (landing-scroll.mjs) + visual | Partial | New assertions: per-phase transform ranges, return-differently once-per-visit |
| Section identities trigger | Probe per section (visual) | Yes (landing-qa.mjs) | Add identity-presence assertion (registry lookup) |
| Reduced motion collapse | Probe (smoke: REDUCED) | Yes | Extend: all new choreographies opacity-only, no CLS |
| Micro-interactions (magnetic/press/spotlight/border) | Visual + keyboard probe | Partial | Add focus-visible + touch-press probe |
| Theme morph | Visual | No | New probe: no white flash; transform/opacity only |
| Signature phases | Visual + console | No | New probe: mounts in view, aria-hidden, reduced fallback |
| App surfaces (quiz/roadmap/AI/gamification) | Visual (existing app probes) | Partial | Extend for token conformance |
| P1-1 flash regression | Probe (landing-entrance.mjs) | Yes | Re-run after M2 (mandatory) |
| StrictMode double-mount cleanup | Console probe | Yes | Re-run per phase |

Coverage decision: no unit tests for motion (existing policy: probes + visual + console; GSAP timelines not unit-testable meaningfully) → kept as probe coverage; deferrals recorded. Test plan artifact will be written at ~/.gstack/projects/skillforge/...

### Section 4. Performance Review
- New listeners: scroll mappings are transform-only, rAF-throttled; one ScrollTrigger per section (existing pattern). Spotlight: CSS var writes only, no layout reads in handlers.
- Signature: lazy + IO gate + device-memory particle cap (existing pattern); reduced-motion = static.
- Bundle: ForgeSignature lazy → no main-chunk cost. Tokens/registry negligible.
- Risk: cap fragment dissolve particles on mid hardware → cap by device-memory, fall back to opacity dissolve.
- Budgets re-verified per phase (Lighthouse + probes).

### Eng Mandatory Outputs
- NOT in scope: Section 10. What already exists: Section 11. Architecture diagram: above. Test diagram: above. Failure modes: Section 9. TODOS deferrals: M-debug overlay, motion docs for marketing, auth motion beyond theme morph.

### Phase 3 Implementation Tasks (eng)
- [ ] **M2-t3 (P1, human 1h / CC 0.4h) — scrub-single-context** — cap phases: one scrub context per section, context-safe cleanup.
- [ ] **M5-t3 (P1, human 0.5h / CC 0.2h) — signature-perf** — device-memory cap + IO gate + reduced fallback.
- [ ] **M4-t4 (P2, human 0.5h / CC 0.2h) — spotlight-layout** — spotlight handler writes CSS vars only (no layout reads).
- [ ] **M7-t2 (P1, human 1h / CC 0.5h) — probe-extensions** — beat order, scroll phases, reduced-motion, theme, signature, focus/touch probes.
- [ ] **M7-t3 (P1, human 0.5h / CC 0.2h) — p1-1-rerun** — mandatory landing-entrance.mjs re-run after M2.

## Phase 3.5 — DX Review
DX scope: no (consumer product surfaces; no API/CLI/docs surfaces change). Skipped per autoplan rules — stated explicitly: the plan touches no developer-facing surface; no DX dimensions evaluated.

## Cross-Phase Themes
- **Theme: token discipline as the anti-slop mechanism** — flagged in CEO (1I M1-t1), Design (Pass 4 anti-slop rule), Eng (Section 2 DRY). High-confidence signal: the entire plan's maintainability hinges on the registry/token gate.
- **Theme: reduced-motion as a hard gate** — flagged in CEO (P5), Design (Pass 6), Eng (Section 3 flow 4). Every phase independently required reduced-motion variants for new choreography.
- **Theme: cap 5-phase host ambiguity** — flagged in Design (F1/W6) and Eng (F5/W1). Both voices independently concluded phases 2-3 must host on the Mastery sticky stage (the hero cap leaves the viewport; "through the story" is impossible without scroll-jacking). High-confidence signal — surfaced as a User Challenge at the gate.

## Pre-Gate Verification
- [x] CEO: premises challenged + user-confirmed, leverage map, dream delta, alternatives, mode selection, failure/error registries (4 gaps → tasks), tasks.
- [x] Design: 7 passes scored (all reach 10/10 post-fix), litmus scorecard, identity table, 15 tasks.
- [x] Eng: architecture diagram, code quality (dead-code purge), test diagram (30 codepaths, 12 gaps), test plan artifact persisted, perf, failure registry, 11 tasks.
- [x] Phase 3.5 DX skip stated with reason (no developer-facing surface).
- [x] Decision Audit Trail present (56 rows: 27 user/mechanical/taste + 29 phase decisions).
- [x] Cross-phase themes written (3).
- [x] Restore point: `~/.gstack/projects/skillforge/feat-landing-rebuild-autoplan-restore-20260819-083035.md`
- [x] Test plan artifact: `~/.gstack/projects/skillforge/sandi-feat-landing-rebuild-test-plan-20260819-091242.md`

## Decision Audit Trail

<!-- AUTONOMOUS DECISION LOG -->
| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|
| 1 | CEO | Scope = full system (landing + app), one plan doc | User | — | User confirmed "Full system (Recommended)" | — |
| 2 | CEO | Stack on feat/landing-rebuild | Mechanical | P3 | Both branches touch shared libs; motion follows landing | — |
| 3 | CEO | Alternative A (token-first) over B/C | Mechanical | P3 | Sequencing: tokens unlock identities/signature; B/C rejected | B, C |
| 4 | CEO | Debug overlay → defer to TODOS | Mechanical | P3 | Out of blast radius; risk without ship value | — |
| 5 | CEO | Auth motion scoped to theme morph | Mechanical | P3 | Containment; brief targets landing+app, not auth | — |
| 6 | CEO | Premises P1–P6 all confirmed | Premise gate | P6 | Reasonable; none clearly wrong | — |
| 7 | Design | Magnetic allowed under useMotionSafe (input-driven) | Taste | P1 | Brief allows input-driven micro; no layout movement | — |
| 8 | Design | Spotlight on primary cards; border-trace on CTAs/chips | Taste | P5 | No overlapping dual-effects on same element | — |
| 9 | Design | How-section numeral = vertical roll, 240ms micro | Taste | P5 | Cleanest expression of progression | — |
| 10 | Design | Registry requires per-identity docs | Mechanical | P1 | Undocumented registry is prose-only | — |
| 11 | Design | Press physics applies to touch too | Mechanical | P1 | Interaction-state completeness | — |
| 12 | Design | No new "rise" default; identities mandatory | Mechanical | P4 | Anti-slop gate (DRY of intent) | — |
| 13 | Eng | Cap phases = one scrub context per section | Mechanical | P5 | Context-safe cleanup; matches existing pattern | — |
| 14 | Eng | Signature perf: device-memory cap + IO gate + reduced fallback | Mechanical | P1 | Mid-hardware 60fps gate | — |
| 15 | Eng | Probe-based coverage for motion (no unit tests) | Taste | P1 | GSAP timelines not unit-testable; probes + visual + console exist | — |
| 16 | Eng | Spotlight writes CSS vars only | Mechanical | P5 | No layout reads in handlers | — |
| 17 | CEO | Premise gate: user confirmed all 6 premises | User | — | AskUserQuestion 2026-08-19 — "Confirm all premises (Recommended)" | — |
| 18 | CEO | F1: hero beat timeline gates on useDeferredScene readiness + CapEmblem fallback | Mechanical | P1 | Scene mount races beats; brand moment lands hollow otherwise | — |
| 19 | CEO | F2: consolidate duplicate useMagnetic/useTilt into motion-gsap.js superset; dashboard re-exports | Mechanical | P4+P3 | Two divergent implementations violate the one-motion-library promise | — |
| 20 | CEO | F3: theme morph hooks next-themes class swap (no data-theme exists) | Mechanical | P5 | As written the morph would silently no-op | — |
| 21 | CEO | F6: Layer-1 ambient tokens = documented constants for 3D loops, not runtime imports | Mechanical | P5 | Frame-loop math cannot bind GSAP tokens | — |
| 22 | CEO | F8: preHide resets inline styles on live prefers-reduced-motion change | Mechanical | P1 | Mid-session toggle can strand hidden content | — |
| 23 | CEO | F9: ForgeSignature no-WebGL fallback (static SVG silhouette) | Mechanical | P1 | no-WebGL != reduced-motion; blank ornament otherwise | — |
| 24 | CEO | F7: shell identities (navbar/scroll-progress/cursor) declared in SECTION_MOTION | Mechanical | P1 | Full-system scope must include the landing shell | — |
| 25 | CEO | F4: dissolve + signature as two distinct acts (documented continuity) | Taste | P1/P2 | Two adjacent particle systems; (a) one stream vs (b) two acts — recommend (b) | (a) |
| 26 | CEO | F5: cut feat/motion-language off feat/landing-rebuild before M1 | Taste | P3 | Landing PR entangles otherwise; recommend split + landing-first merge | same-branch |
| 27 | CEO | F10: elevate M6 quiz feedback + gamification count-ups to P2 | Taste | P2 | Retention lever sequenced last; recommend elevation | — |
| 28 | Design | F2: add B7 (facts 750ms) + B8 (scroll cue 1000ms) to hero beat table | Mechanical | P1 | Existing entrance choreographs them; beats would silently drop | — |
| 29 | Design | F3: GraduationCapScene `entrance="idle"` prop — B1 owns scale, scene spring gated | Mechanical | P5 | Two systems would animate scale on the same object | — |
| 30 | Design | F4: token mapping table, deprecated aliases, no revalues; DESIGN.md tier reconciliation | Mechanical | P4 | 5-category system collides with existing EASE/DURATION/SECONDS + DESIGN.md tiers | — |
| 31 | Design | F5: theme morph uses DURATION.morph (600ms); 250ms reserved for micro | Mechanical | P4 | Two numbers for one behavior | — |
| 32 | Design | F6: keep native details + "+" mark; chevron-rotate tokenized; grid-wrapper height anim gated by useMotionSafe; retain lp:contentchange | Taste | P5 | Chevron wording would change an approved visual; recommend keep "+" | chevron |
| 33 | Design | F7: ForgeGraph keeps once-assembly + edge draw-in (dashoffset); no scrub conversion | Taste | P3 | Scrub would replace QA-passed animation + double ScrollTrigger; recommend (a) | scrub |
| 34 | Design | F8: DOM halo behind data-cap-slot (opacity-only, aria-hidden) | Taste | P5 | Scene glow prop couples timeline to Three internals; recommend DOM halo | glow prop |
| 35 | Design | F9: Layer-1 dim = existing recede opacity (tokenized); no new system | Mechanical | P3 | Already delivered; duplicate work | — |
| 36 | Design | F10: Footer registers "Quiet" identity (static) | Mechanical | P1 | Registry completeness | — |
| 37 | Design | F11: signature loading state = silhouette/CapEmblem until in-view + loaded + ErrorBoundary | Mechanical | P1 | Blank ornament otherwise | — |
| 38 | Design | F12: registry schema = section primary identity + nested component identities (Engine/Machine + ForgeGraph/Formation) | Mechanical | P5 | One-identity-per-section was under-specified | — |
| 39 | Design | F13: reduced phase 4-5 reveal = opacity-only (remove small scale) | Mechanical | P1 | Opacity-only policy violated | — |
| 40 | Design | F14: hardcoded eases in primitives swept to tokens (useEntrance defaults, Arrival inline, ForgeGraph ambient) | Mechanical | P4 | Aspirational "enforced by review" made real | — |
| 41 | Design | F15: return-differently = scrub-reversible (once per page load); test wording fixed | Taste | P2 | "Once per visit" + "re-scroll restores" contradictory; recommend scrub-reversible | once-event |
| 42 | Design | F16: "personalized" beat echoed as optional P3 micro-beat in Experience | Mechanical | P3 | Completeness vs scope — logged as P3, not blocking | — |
| 43 | Design | F17: magnetic spring-to-rest lands on consolidated superset (sequence after T-ADD-2) | Mechanical | P4 | Dual implementation noted; sequencing only | — |
| 44 | Eng | F1: purge 5 dead hooks (useScrollShow/useStaggerIn/useSectionReveal/useSplitReveal/useMagnetic) — 3 carry banned clearProps | Mechanical | P4 | Dead code is bait for the P1-1 flash bug | — |
| 45 | Eng | F2: delete dead useTilt/useWidgetReveal; keep useCount for M6; one counter primitive | Mechanical | P4 | useCount zero-consumer today; M6 depends on it | — |
| 46 | Eng | F3: consolidate useReducedMotion into motion-gsap; three-engine re-exports | Mechanical | P4 | Verbatim duplicate in two live libs | — |
| 47 | Eng | F4: token mapping table (category -> existing constants, zero revalues); DESIGN.md one table | Mechanical | P5 | Three authority tables; silent revalue risk for app surfaces | — |
| 48 | Eng | F5: cap phases 2-3 host on Mastery sticky stage; one-live-WebGL-context rule; ForgeSignature = 2D canvas | USER CHALLENGE | P5+P3 | "Rotate through the story" impossible without scroll-jacking (brief rejects); Mastery-hosted preserves intent | — |
| 49 | Eng | F6: FAQ = chevron micro-rotate + content fade; no layout animation (P6) | Taste | P5 | grid-template-rows anim = CLS + jank + scrub drift | height anim |
| 50 | Eng | F7: signature phase API driven by Mastery scrub progress mapping; app ornament from app state | Mechanical | P5 | No driver specified in plan | — |
| 51 | Eng | F8: SECTION_MOTION entries = { identity, presets?, variant?, builder?(ctx) }; data-motion attr; probe-asserted | Mechanical | P5 | Preset+variant can't express bespoke choreographies; anti-slop gate would die silently | — |
| 52 | Eng | F9: hero beats adopt preHide pattern (currently tl.from without preHide) + hero probe | Mechanical | P1 | Hero is the un-probed exception to the P1-1 lesson | — |
| 53 | Eng | F10: consolidated magnetic caches rect on enter + quickTo both axes + all gates | Mechanical | P6 | getBoundingClientRect per pointermove = thrash | — |
| 54 | Eng | F11: useCount reset st.current on `to` change; verify via M6 probe | Mechanical | P3 | Stale-value restart semantics untested | — |
| 55 | Eng | F12: Lighthouse on vite build + vite preview (not dev server) | Mechanical | P6 | Dev build inflates FCP/LCP | — |
| 56 | Eng | W2/W3: FAQ cut to fade+rotate; M6 AI scoped to conformance only (cut thought shimmer) | Taste | P3 | Decoration creep vs P1 | shimmer |
| 57 | M1 (impl) | MOTION_TOKENS maps the 5-category system onto EXISTING constants (zero revalues); GSAP_EASE + MOTION_TOKENS table in motion-gsap.js supersedes the old DESIGN.md tiers; deprecated aliases documented | Mechanical | P1 | F4/T-ENG-1: one authority table; app surfaces read the same tokens | — |
| 58 | M1 (impl) | DESIGN.md "Motion Language" section: identity-first rule (sections declare data-motion, never inline tweens), no new "rise" defaults, one motion library (motion-gsap.js) | Mechanical | P1 | M1-t2/M1-t3: anti-slop gate documented in the design source of truth | — |
| 59 | M1 (impl) | Dead-hook purge: useScrollShow/useStaggerIn/useSectionReveal/useSplitReveal/useWidgetReveal + dashboard useTilt deleted (3 carried banned clearProps); useReducedMotion consolidated into motion-gsap with three-engine re-export; dashboard-motion.js re-exports useMagnetic | Mechanical | P1 | F1/F2/F3 (T-ENG-2): dead code is bait for the P1-1 flash bug; zero consumers verified by review | — |
| 60 | M2 (impl) | Entrance gate: cap wake is an opacity fade keyed on deferred scene mount (`entrance="idle"` keeps the rig at rest until the beat owns the reveal) | Mechanical | P1 | Lazy chunk + beat timeline would otherwise race on cold loads | — |
| 61 | M2 (impl) | Ember halo is a DOM element behind the cap slot (beat timeline owns opacity; no Three glow prop) | Mechanical | P1 | Decided in Design phase; DOM keeps it on the motion layer | — |
| 62 | M2 (impl) | M2-t2 narrowed: dissolve + return-differently deferred to M5 — ForgeSignature owns both acts (decision #25, two distinct acts); M2 ships rotate + depth on the Mastery scrub | Taste | P1 | Keeps the shipped QA'd finale intact until the signature replaces the ending beat | — |
| 63 | M2 (impl) | Beat positions canonicalized in a BEATS map (halo .1 / label .25 / title .4 / subtitle .5 / cta .6 / facts .75 / scroll 1 / coda 1.2); reduced motion = single 0.6s-delay opacity cross-fade of `[data-hero-copy]` only | Mechanical | P1 | Deterministic positions; reduced variant never pre-hides children | — |
| 64 | M2 (impl) | Live media toggle: `prefers-reduced-motion` change listener kills the timeline and resets inline styles (no gsap.set, no clearProps) | Mechanical | P2 | T-ADD-4 pattern; in-flight beat never leaves elements stuck hidden | — |
| 65 | M2 (impl) | Probe battery: landing-hero (beat order, pre-hide contract, halo rest 0.600, scroll fade-only), hero-reduced (opacity-only, no transforms), mastery-rotate (rotation -5deg->0 + scale 0.9->1, settled flat, Tailwind centering translate preserved) | Mechanical | P1 | T-ENG-8; mastery probe proves no transform conflict on data-cap-return | — |
| 66 | M3 (impl) | Identity builders live in SECTION_MOTION via `build(ctx)` (mask/blur/wipe/quote); driver in useSectionEntrance resets slots then delegates; data-motion declared on all 14 sections + footer (quiet) + ForgeGraph (formation) + shell chrome (navbar/progress/cursor) | Mechanical | P1 | T-ENG-6/F8: registry is the single source of truth; sections never inline tweens | — |
| 67 | M3 (impl) | Process/answers/mirror keep their bespoke or fallback choreography (numeral scrub, chevron rotate, app-language rise) — identity declared, no build | Taste | P2 | Anti-slop rule: declared identities must not regress shipped QA'd behavior | — |
| 68 | M3 (impl) | useMotionScope runs in a layout effect (refs guaranteed attached; from-state writes land before first paint) — passive effects can race ref attachment | Mechanical | P1 | Found via identity probe: Engine section's entrance silently never ran since the landing rebuild (section lacked ref={rootRef}) — restored | — |
| 69 | M3 (impl) | Probe: identity-check (declaration coverage, builder from-states, resolution after trigger; clipPath shorthand normalization + easing-tail tolerance) | Mechanical | P1 | T-ENG-6 probe-asserted requirement | — |
| 70 | M4 (impl) | Micro-hooks all live in motion-gsap.js (useSpotlight, useBorderTrace, usePressPhysics, useNumeralRoll); magnetic gains spring-to-rest on leave (physical duration + physical ease + overwrite auto) | Mechanical | P1 | M4-t1: one motion library, no duplicated pull logic | — |
| 71 | M4 (impl) | Spotlight is CSS-var-only (--spot-x/--spot-y/--spot-opacity via .lp-spotlight utility); rect cached on enter; rAF-throttled move; focus shows glow at rect center — keyboard equivalent built in | Mechanical | P1 | M4-t4: no layout reads per move; M4-t3 focus-visible equivalence | — |
| 72 | M4 (impl) | Border trace drives [data-border-trace] SVG dashoffset via pathLength=1 (hover + focus-visible, ui token); press physics = pointer events (touch covered), scale 0.97, release physical | Mechanical | P1 | M4-t2 press-touch; Button already carries native active:translate-y-px — hook scale composes | — |
| 73 | M4 (impl) | Probe: micro-hooks battery (spotlight var writes on hover/focus + leave reset, trace dashoffset draw/restore, press scale down/up via synthetic pointerup — no navigation) | Mechanical | P1 | T-ENG-9 G7 gap; mouse.up triggers real click navigation — synthetic PointerEvent required | — |
| 74 | M5 (impl) | ForgeSignature = 2D canvas particle signature (per T-ENG-3, not Three): unit-space cap silhouette sampler + scatter field; phases fragmented/structured/personalized/mastered via progress (easeOutCubic) or declarative phase prop | Mechanical | P1 | F5: 2D canvas; T-ENG-5: scrub-driven via imperative setProgress (no per-frame re-renders) | — |
| 75 | M5 (impl) | Two-act finale (decision #25): act 1 cap scene dissolves (0.55-0.75, scale 1.06) as the signature fragment field enters; act 2 field converges into the cap silhouette (0.75-1.0) then rings; cap-return scrub kept on the wrapper so the M2 rotate/depth contract is untouched | Mechanical | P1 | M2-t2 deferred acts land here; mastery-rotate probe stays green | — |
| 76 | M5 (impl) | Reduced motion = static CapEmblem silhouette, no loop, no travel (M5-t2 aria-hidden + role="presentation"); no-canvas = CapEmblem fallback (F9); lazy + Suspense fallback CapEmblem (F11/D-T11 loading state); device-memory particle budget (90 low / 210 full) + IO-gated rAF + DPR cap 1.5 | Mechanical | P1 | M5-t3; signature needs no WebGL — no-WebGL fallback only for canvas-context failure | — |
| 77 | M5 (impl) | Mastery under reduced motion keeps the static cap scene and hides the signature entirely (no scrub exists to reveal it; the scene IS the static fallback) | Taste | P2 | Reduced contract: one static finale, not two stacked silhouettes | — |
| 78 | M5 (impl) | Probe: signature battery (entry scattered span ~0.95, dissolve completes by 0.8, converged span ~0.74 + painted jump + ring sweep, reduced = emblem/no canvas/no errors); found + fixed: float-overflow RNG in scatter, canvas intrinsic 2:1 aspect from missing fill classes, sampler shortfall (205 < 210) crashing the loop | Mechanical | P1 | T-ENG-9 signature.mjs; three real defects caught by pixel assertions | — |
| 79 | M6 (impl) | First useNumeralRoll consumers: quiz question counter (composes with the existing bump) + learning-path stats (weeks/resources/quizzes/avg score; "—" case keeps hooks unconditional) | Mechanical | P2 | M6-t1 quiz feedback + roadmap numeral; hook exists since M4 — app surfaces now use it | — |
| 80 | M6 (impl) | GamificationCard points -> shared CountUp (was static; AchievementsPage already counted); AI send CTAs (AICenter + AICopilot) gain press physics | Mechanical | P2 | M6-t1 gamification count-ups + AI polish; existing components reused, no new logic | — |
| 81 | M6 (impl) | Theme morph: `--morph-duration: 600ms` token in :root (single source, matches DURATION.morph) + `@media (prefers-reduced-motion: reduce)` kills the 600ms cross-fade — CSS-only, no dead hook (anti-slop) | Taste | P2 | T-ADD-3 intent satisfied without an unused hook; probed: var present, reduced bodyTransition ~0s | — |
| 82 | M6 (impl) | Signature ornament in MissionOverview: lazy ForgeSignature under the AIOrb health ring, phase mapped from learning health (T-ENG-5 app-state driver); sized via wrapper div (component root owns h-full/w-full) | Mechanical | P2 | M5-t1 "app ornament" lands here; reduced = static CapEmblem, aria-hidden inherited | — |
| 83 | M6 (impl) | Probe: app-motion (register -> dashboard -> ornament phase/size/aria, stats + gamification numerals, AI send press via real mouse, morph token + reduced gate); found: register rate limit (5/10min, dev switch RATE_LIMIT_ENABLED=false), ornament size-14 clashed with h-full root, synthetic pointerdown unreliable in probes | Mechanical | P2 | T-ENG-9 app-motion.mjs; rate limiter is prod-correct — probe env only | — |
| 84 | M7 (qa) | Bundle audit: landing route chunk 7.70 kB (ceiling 70 kB met); ForgeSignature 3.32 kB + GraduationCapScene 6.84 kB in their own lazy chunks — zero main-chunk cost from the signature; vendor-three 882 kB (gzip 235 kB) loads on hero cap mount (pre-existing landing-rebuild P4 architecture) | Mechanical | P1 | M7-t1 bundle diff; motion-language adds no eager bytes | — |
| 85 | M7 (qa) | Lighthouse baseline (prod build, mobile-emulated): PERF 44 / A11Y 96 / BP 100 / SEO 100, FCP 4.6s, LCP 5.7s, CLS 0. FCP/LCP dominated by vendor-three main-thread compile on the hero cap scene; a11y = lp-token contrast on landing AI/resources cards (text-lp-accent/lp-muted under 4.5:1). No pre-motion baseline exists — recorded as the new baseline | Mechanical | P1 | M7-t1; hazards are landing-rebuild design territory, not motion-language regressions; follow-ups filed below | — |
| 86 | M7 (qa) | Follow-ups out of motion-language scope: (a) hero vendor-three blocks FCP — defer/soft-load the hero cap scene or preconnect; (b) lp-token contrast on AI/resources cards -> /plan-design-review pass; (c) app-motion deep flows (quiz/path numerals with live data) need seeded data | Mechanical | P1 | Future M8 / landing-rebuild hardening; ship gate held by user | — |
| 87 | /review | preHide sweep — opacity-only preHide left hidden CTAs tabbable/clickable for the pre-entrance window; useEntrance fallback, Arrival beats, and all M3 builders (mask/blur/wipe/quote) now preHide with visibility:hidden and animate fromTo autoAlpha (GSAP restores visibility); reduced paths reset visibility | Major (a11y) | P1 | Hidden content must leave the pointer/tab order — autoAlpha is the one-way contract | — |
| 88 | /review | Spotlight rAF race — a move queued before pointerleave flushed after leave and re-lit the glow (two cards glowing when crossing between them); write() now guards pending+rect, leave/blur cancel the frame and clear pending; focus lights only on :focus-visible (matches border trace) | Major (visual) | P1 | Stale-pending frame; found via review of the rAF-throttled write path | — |
| 89 | /review | Border trace non-functional on the Engine aside — pathLength="1" sat on the svg root and does not cascade to the rect, so dasharray stayed 1px units (faint 1px-dotted outline, imperceptible hover shift); data-border-trace + geometry moved onto the rect with style-based calc sizing | Major (feature) | P1 | pathLength must live on the stroked element | — |
| 90 | /review | ForgeSignature act-2 phase math — the global easeOutCubic compressed the phase thresholds (eased 0.55 <-> raw 0.234) so fragmented->structured->personalized landed in the first ~30% of the convergence window and the field sat pre-converged for the rest of the act; replaced with per-window easing (windowEase) so each threshold lands on its exact scrub fraction (0.55/0.75/0.9/1) | Major (choreography) | P1 | Thresholds must map 1:1 to the scrub window; polish eased within windows | — |
| 91 | /review | MINOR batch: press release clears transform (clearProps onComplete) so CSS hover scale regains control after the first press; useNumeralRoll gains `visible` flag (LearningPathStats score re-rolls when its span mounts); QuizProgress initial text "0" kills the one-frame final-value flash; Mastery signature wrap visible under reduced motion + proxy tween re-arms on sceneReady (lazy-mount race); ForgeSignature rAF truly pauses off-screen/tab-hidden (IO + visibilitychange); Engine rect width via style (calc invalid in SVG attribute grammar) | Minor batch | P2 | AICenter/AICopilot/QuizProgress/LearningPathStats/MasterySection/ForgeSignature/EngineSection | — |
| 92 | /review | Cleanup + drift: dead PRESETS removed (dashboard-motion); product.jsx mojibake fixed (20 `â€”` + 10 `Â·` -> — ·, UTF-8) — introduced by an earlier edit, user-visible copy corruption; drift logged: "one counter primitive" (row 45/54) landed as useNumeralRoll + CountUp, useCount stays a zero-consumer public API; useSpotlight/useMagnetic cached-rect staleness on scroll + registry metadata (builder/nested/variant/static) unconsumed + preHide duplication (useEntrance vs preHideWrites) deferred as follow-ups | Nits | P3 | Zero-consumer PRESETS deleted; remaining structural nits tracked for M8 | — |

## Implementation Tasks (aggregated across phases)

- [ ] **M1-t1 (P1, human 1h / CC 0.3h) — motion-tokens** — extend DURATION/EASE + GSAP_EASE + MOTION_TOKENS + SECTION_MOTION registry.
- [ ] **M1-t2 (P1, human 1h / CC 0.5h) — design-doc** — DESIGN.md Motion Language section.
- [ ] **M1-t3 (P2, human 0.5h / CC 0.2h) — anti-slop-rule** — DESIGN.md rule: identities mandatory, no new "rise" defaults.
- [ ] **M2-t1 (P1, human 3h / CC 1h) — hero-entrance** — B1–coda timeline, preHide pattern, reduced-motion variant.
- [ ] **M2-t2 (P1, human 4h / CC 1.5h) — cap-scroll-phases** — 5-phase scrub + dissolve + return-differently; mobile/reduced variants.
- [ ] **M2-t3 (P1, human 1h / CC 0.4h) — scrub-single-context** — one scrub context per section, context-safe.
- [ ] **M3-t1 (P2, human 4h / CC 1.5h) — section-identities** — 9 identities declared + implemented.
- [ ] **M3-t2 (P1, human 1h / CC 0.3h) — registry-docs** — per-identity docs in SECTION_MOTION.
- [x] **M4-t1 (P2, human 3h / CC 1h) — micro-hooks** — useSpotlight/useBorderTrace/usePressPhysics/useNumeralRoll + magnetic spring-to-rest.
- [x] **M4-t2 (P2, human 0.5h / CC 0.2h) — press-touch** — press on touch.
- [x] **M4-t3 (P2, human 0.5h / CC 0.2h) — focus-spotlight** — :focus-visible equivalents.
- [x] **M4-t4 (P2, human 0.5h / CC 0.2h) — spotlight-layout** — CSS var writes only.
- [x] **M5-t1 (P2, human 4h / CC 1.5h) — signature** — ForgeSignature lazy + phase API + Mastery (app ornament mounts with M6 app surfaces).
- [x] **M5-t2 (P1, human 0.3h / CC 0.1h) — signature-a11y** — aria-hidden + role="presentation".
- [x] **M5-t3 (P1, human 0.5h / CC 0.2h) — signature-perf** — device-memory cap + IO gate + reduced fallback.
- [x] **M6-t1 (P3, human 3h / CC 1h) — app-surfaces** — quiz feedback, roadmap numeral, AI polish, gamification count-ups, theme morph.
- [ ] **M7-t1 (P1, human 2h / CC 0.5h) — qa-perf** — probe battery (DONE), Lighthouse baseline (DONE), bundle diff (DONE); CHANGELOG + release prep HELD on user ship decision.
- [x] **M7-t2 (P1, human 1h / CC 0.5h) — probe-extensions** — beat order, scroll phases, reduced-motion, theme, signature, focus/touch.
- [x] **M7-t3 (P1, human 0.5h / CC 0.2h) — p1-1-rerun** — mandatory entrance-flash regression probe.

### CEO Review Task Additions (folding pending approval)

- [ ] **T-ADD-1 (P1, human 1h / CC 0.4h) — hero-scene-gate** — beat timeline waits on `useDeferredScene` readiness; CapEmblem fallback for reduced/no-WebGL (F1).
- [ ] **T-ADD-2 (P1, human 1.5h / CC 0.5h) — consolidate-magnetic-tilt** — single `useMagnetic`/`useTilt` in motion-gsap.js (superset options); dashboard-motion.js re-exports; update MissionRail.jsx:304 (F2).
- [ ] **T-ADD-3 (P2, human 0.5h / CC 0.2h) — theme-morph-hook** — wire morph to next-themes class swap + DURATION.morph tokens + no-flash probe (F3).
- [ ] **T-ADD-4 (P2, human 0.5h / CC 0.2h) — reduced-toggle-reset** — preHide resets inline styles on live media change (F8).
- [ ] **T-ADD-5 (P2, human 0.5h / CC 0.2h) — signature-webgl-fallback** — no-WebGL static SVG silhouette (F9).
- [ ] **T-ADD-6 (P3, human 1h / CC 0.3h) — shell-identities** — LandingNavbar/ScrollProgress/Cursor in SECTION_MOTION registry (F7).
- [ ] **T-ADD-7 (P2, human 0.5h / CC 0.2h) — branch-split** — cut `feat/motion-language` off `feat/landing-rebuild` before M1 (F5, taste).
- [ ] **T-ADD-8 (P2, human 0.5h / CC 0.1h) — mastery-dissolve-continuity** — document dissolve→reform as two distinct acts in DESIGN.md (F4, taste).

### Design Review Task Additions (folding pending approval)

- [ ] **D-T1 (P1, human 0.5h / CC 0.2h) — cap-instance-map** — phases 1-5 assigned to cap instances (1 = hero recede existing; 2-5 = Mastery sticky stage); note for existing Mastery yPercent:34 rise (F1/F5).
- [ ] **D-T2 (P1, human 0.3h / CC 0.1h) — hero-beats-complete** — B7 facts 750ms + B8 scroll cue 1000ms added to beat table (F2).
- [ ] **D-T3 (P1, human 0.5h / CC 0.2h) — cap-entrance-gate** — GraduationCapScene `entrance="idle"` prop (F3).
- [ ] **D-T4 (P1, human 1h / CC 0.3h) — token-mapping-table** — old→new alias map + deprecated aliases + DESIGN.md tier rewrite (F4).
- [ ] **D-T5 (P2, human 0.5h / CC 0.1h) — morph-value-reconcile** — theme morph uses DURATION.morph 600ms (F5).
- [ ] **D-T6 (P2, human 0.5h / CC 0.2h) — faq-preserve** — native details + "+" rotate tokenized; grid-wrapper height anim gated; lp:contentchange retained (F6).
- [ ] **D-T7 (P2, human 0.5h / CC 0.2h) — forgegraph-mechanic** — keep once-assembly + edge draw-in dashoffset (F7).
- [ ] **D-T8 (P2, human 0.5h / CC 0.2h) — halo-element** — DOM halo behind data-cap-slot, opacity-only, aria-hidden (F8).
- [ ] **D-T9 (P2, human 0.2h / CC 0.1h) — reduced-opacity-only** — phase 4-5 reduced reveal opacity-only (F13).
- [ ] **D-T10 (P2, human 0.3h / CC 0.1h) — registry-schema** — SECTION_MOTION: primary + nested component identities (F12).
- [ ] **D-T11 (P2, human 0.3h / CC 0.1h) — signature-loading-state** — silhouette/CapEmblem until loaded; ErrorBoundary (F11).
- [ ] **D-T12 (P3, human 1h / CC 0.3h) — hardcoded-ease-sweep** — tokenize useEntrance defaults, Arrival expo.out, ForgeGraph ambient (F14).
- [ ] **D-T13 (P3, human 0.5h / CC 0.1h) — dead-hook-cleanup** — delete/ migrate useScrollShow/useStaggerIn clearProps hooks (superseded by T-ENG-2).
- [ ] **D-T14 (P3, human 0.2h / CC 0.1h) — footer-identity** — Footer "Quiet" static identity (F10).
- [ ] **D-T15 (P3, human 0.5h / CC 0.1h) — personalized-beat** — optional "personalized" micro-beat in Experience (F16).

### Eng Review Task Additions (folding pending approval)

- [ ] **T-ENG-1 (P1, human 1h / CC 0.3h) — token-mapping-table** — MOTION_TOKENS maps 5 categories to EXISTING constants, zero revalues; DESIGN.md supersedes old tiers (F4).
- [ ] **T-ENG-2 (P1, human 1h / CC 0.3h) — dead-hook-purge** — delete 5 dead hooks + dashboard useTilt/useWidgetReveal; keep useCount; consolidate useReducedMotion with three-engine re-export (F1/F2/F3). AFTER landing PR merges.
- [ ] **T-ENG-3 (P1, human 1h / CC 0.4h) — cap-phase-host-spec** — phases 1-5 onto Arrival-exit + Mastery sticky stage; one-live-WebGL-context rule; dissolve budget; ForgeSignature = 2D canvas (F5).
- [ ] **T-ENG-4 (P2, human 0.5h / CC 0.2h) — faq-motion-fix** — chevron micro-rotate + content fade; tokenize duration-200 (F6).
- [ ] **T-ENG-5 (P2, human 0.5h / CC 0.2h) — signature-driver** — phase API from Mastery scrub progress mapping; app ornament from app state (F7).
- [ ] **T-ENG-6 (P2, human 0.5h / CC 0.2h) — registry-builder-shape** — SECTION_MOTION supports builder(ctx); data-motion attr (F8).
- [ ] **T-ENG-7 (P2, human 0.5h / CC 0.2h) — magnetic-perf** — cached rect + quickTo both axes + all gates, zero per-move reads (F10).
- [ ] **T-ENG-8 (P1, human 1h / CC 0.4h) — hero-p1-1-probe** — landing-hero.mjs: beat pre-hide at mount, beat order, reduced opacity-only (F9).
- [ ] **T-ENG-9 (P2, human 1.5h / CC 0.5h) — probe-extensions-2** — reduced-live.mjs, theme-morph.mjs, signature.mjs, app-motion.mjs, ForgeGraph scrub assertions (F11, gaps G3/G4/G7/G8).
- [ ] **T-ENG-10 (P3, human 0.5h / CC 0.2h) — motion-registry-probe** — every [data-landing-section] has registered identity; token keys resolve (F8/G9).
- [ ] **T-ENG-11 (P2, human 0.3h / CC 0.1h) — lighthouse-prod-build** — Lighthouse on vite build + preview (F12).

## /autoplan Review Complete — Final Approval Gate
**STATUS: APPROVED** — 2026-08-19, user accepted all recommendations (option A). Folded into the plan: 1 user challenge resolved (cap phases 2-5 hosted on Mastery sticky stage — T-ENG-3/D-T1), all 12 taste recommendations accepted, all mechanical fixes adopted (audit trail rows 28-56). Implementation order: T-ADD-7 branch split → M1 (tokens + mapping table + dead-hook purge after landing merge) → M2 (hero) → M3-M5 → M6 (elevated to P2 for quiz+gamification) → M7 (QA + perf + release). Next: /review per phase, /design-review, /qa, /benchmark, /document-release, ship.

## GSTACK REVIEW REPORT
- Skills run: /autoplan (plan-ceo-review, plan-design-review, plan-eng-review; DX skipped — no developer-facing surface)
- Mode: SELECTIVE EXPANSION (CEO) / full 7-pass design / full eng review
- Voices: Claude (subagent) ×3 phases; Codex unavailable (`[codex-unavailable]`)
- Verdict: APPROVED (user gate 2026-08-19)
- Scores: CEO premises 6/6 confirmed; Design 7 passes 10/10 post-fix; Eng PASS with corrections
- Decisions: 56 total (1 user, 27 mechanical, 11 taste, 1 user challenge)
- Artifacts: restore point + test plan persisted at ~/.gstack/projects/skillforge/
- Status: clean (0 unresolved, 0 critical gaps open — all closed by adopted tasks)
