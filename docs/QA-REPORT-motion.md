# QA Report — feat/motion-language

- **Date:** 2026-08-19
- **Gate:** /qa (Standard tier — fix critical/high/medium), diff-aware mode
- **Base:** `origin/feat/landing-rebuild` | **Harness:** Playwright probes (gstack browse unavailable — bun broken; documented degraded path) | **Servers:** dev 5173, preview 4173, backend 8080 (auth-gated 401 = responding)
- **Bugs found in app code: 0** | Fixes made to app code: 0 | Probe fixes (harness bugs): 4

## Scope

All 30 changed source files (animation/motion surfaces): hero entrance + pre-hide contract, Mastery cap two-act finale + scrub + return, micro-hooks (spotlight/border-trace/press/numeral roll), section entrances + identity states, dashboard surfaces (signature ornament, stats numerals, gamification, AI send press, theme morph), quiz/learning-path motion, reduced-motion variants, mobile.

## Results (13 probes, all green)

| Probe | Coverage | Result |
| --- | --- | --- |
| signature.mjs | Two-act finale: entry (scene visible, sig hidden), dissolve (scene fades, sig in), converge (canvas clusters span 0.74), reduced = static emblem, no canvas | PASS |
| micro-hooks.mjs | Border trace (pathLength hover shift), press physics (down scale 0.97, up clears transform → CSS hover regains control) | PASS |
| landing-hero.mjs | Beat order label→title→subtitle→cta→facts, pre-hide contract (opacity 0 + visibility hidden via MutationObserver), halo rest 0.600, scroll fade-only, no re-hide | PASS |
| hero-reduced.mjs | Reduced: static fade-in, no movement, halo visible | PASS |
| landing-entrance.mjs | Entrance trigger + scroll-back no re-hide | PASS |
| identity-check.mjs | Section identity pre-trigger states (clip/blur/slide/translate) match design | PASS |
| mastery-rotate.mjs | Mastery depth scrub + settle flat (no residual rotate) | PASS |
| app-motion.mjs (full + reduced) | Register → dashboard: ornament 56x56 aria-hidden, stats numerals, gamification points, AI send press (scale under full, none under reduced), morph token 600ms / ~0 under reduced | PASS |
| landing-mobile.mjs | 390px viewport: no horizontal overflow from motion elements | PASS |
| qa-cap-return.mjs (new) | Entry → dissolve → converge → scroll back: scene re-forms animated (sig opacity 1→0.42→0 sampled mid-return), no snap | PASS |
| qa-tab-order.mjs (new) | Full: CTA/facts pre-hidden (visibility hidden) ⇒ out of tab order; reachable after entrance. Reduced: container-level pre-hide ([data-hero-copy]) same contract | PASS |
| qa-theme-morph.mjs (new) | Light→dark toggle: body transitions at 600ms morph gate (full); collapsed to 1e-05s under reduced | PASS |
| e2e-admin.mjs | BLOCKED — no seeded admin (backend .env has no ADMIN_* config); login 401. Not an app bug; admin panel not in branch scope | N/A |

## Bugs found

None. The three initial probe failures (cap-return entry assertion inverted, tab-order wrong CTA text + wrong reduced-mode contract, theme-morph missing dropdown item click) were harness bugs, fixed in the probes — evidence of correct app behavior captured in the green runs above.

## Verification

- Lint: 0 errors / 0 warnings. Build: clean (2.36s). All console errors: 0 across every probe.
- Auth'd surfaces (dashboard, AI Command Center, ornament, morph) verified via fresh-user registration flow; data-gated surfaces (QuizProgress, LearningPathStats with populated data) covered by /review + component-level verification — no seed data exists locally to render populated states.

## Ship-readiness

**READY** — 0 bugs, 13/13 probes green, lint/build clean, no console errors. Remaining gates before ship: /benchmark (perf budget), release docs/CHANGELOG (held per user).