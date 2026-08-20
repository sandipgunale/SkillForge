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

---

## Addendum 1 — Production rendering/stability audit (2026-08-20)

Second QA pass scoped to the reported rendering-stability bugs (auth pages not
rendering / theme flash / invisible cap / WebGL warning / scroll jitter). All
root causes found and fixed; 8 bugs closed, 5 suspected issues verified as
non-issues. Two new probe suites (Playwright, degraded path):

### qa-stability.mjs — 20/20 PASS

| Coverage | Result |
| --- | --- |
| Theme pre-hydration: `html.dark` + `colorScheme` present at first paint (dark-pref context), no flash | PASS |
| Toggle visible on first paint; aria reflects accurate state ("Theme: System" when unset) | PASS |
| Switch→Dark persists across reload | PASS |
| First-load no-interaction @ 1440×900 and 390×844 on `/`, `/login`, `/register` (toggle visible, card opacity 1, email input, single canvas) | PASS (6/6) |
| Reduced-motion: cap painted static (no click), hero visible, login card visible | PASS |
| Canvas wrapper `pointer-events: none`; `elementFromPoint` over email input returns INPUT | PASS |
| Auth bootstrap bounded: card renders in 5.7s with hanging backend (was up to 120s) | PASS |
| Slow-chunk (4s route delay): CapEmblem visible during load, scene visible after; no blank swap | PASS |
| No THREE.Clock deprecation warnings; no console errors | PASS |

### qa-stability2.mjs — 11/11 PASS

| Coverage | Result |
| --- | --- |
| Login↔register route transitions (card + toggle always present) | PASS |
| DPR-2 canvases sized 1461×1461 (landing cap) and auth scene | PASS |
| WebGL disabled: cap falls back to CapEmblem, hero visible; auth form renders (no white-screen) | PASS |
| Scroll CLS = 0.0002 (< 0.05 budget) over full-page scroll; mastery scene mounts on scroll | PASS |
| Scroll-back-to-top settles at 0 (no residual) | PASS |
| Auth theme switch to light persists | PASS |
| Zero page errors (no "Error creating WebGL context") | PASS |

### Bugs fixed (8)

1. **Theme flash / nondeterministic first paint** — next-themes (React/Vite) does not
   auto-inject its bootstrap script; added inline pre-hydration script to `index.html`.
2. **Auth pages blocked up to 120s** — `/auth/refresh` inherited the 120 000 ms client
   timeout; bounded to 5 s so a stale session + dead backend can't gate the login form.
3. **Decorative canvas blocked email input** — AuthLayout layer-3 + LivingCoreScene lacked
   `pointer-events-none`; R3F canvas was an interactive event root.
4. **LivingCoreScene ignored reduced motion** — always-on frameloop under
   `prefers-reduced-motion`; now `demand` (static frame, no per-frame cost).
5. **WebGL disabled white-screened auth** — R3F threw "Error creating WebGL context" with no
   boundary; added WebGL probe (returns null) + AuthLayout `SceneBoundary` (degrades to null).
6. **Hero cap invisible on slow networks** — one-shot fade keyed on `sceneReady` could fire
   before the lazy chunk resolved, stranding `opacity:0`; cap now self-fades on mount;
   Arrival/Mastery Suspense fall back to CapEmblem (was `null`).
7. **Blank swap window on lazy chunk load** — `fallback={null}` replaced with `<CapEmblem/>`.
8. **Blank screen on chunk-load failure** — added `errorElement: <AppError />` to landing and
   auth route groups (MainLayout/Showcase already had it).

### Dependency fix

**THREE.Clock deprecation warning** — three r183+ warns in the Clock constructor; R3F
9.6.1 (and latest 9.7.0, verified) constructs `new THREE.Clock()` internally per Canvas, so
no app change can silence it. Pinned `three` to `~0.182.0` (last pre-deprecation release;
R3F peer range satisfied; all scene APIs unchanged). Zero console warnings verified.

### Verified non-issues

- Theme-toggle stacking/contrast (renders above all layers, 44px target).
- React StrictMode: superseded — see Addendum 3 (R3F 9.6.x context-dispose bug;
  StrictMode removed in `main.jsx`).
- Scroll jitter sources (transform-only, single transform owner, CLS 0.0002).
- Auth-card entrance (gsap.from + reduced paths safe on fresh load).
- Logo breathe animation (CSS keyframes, no layout).

### Verification

- Lint: 0 errors / 0 warnings. Build: clean (2.23s). Probes: 31/31 PASS across both suites.
- Remaining console noise: Chrome headless SwiftShader "GPU stall / GL_CLOSE_PATH_NV" driver
  hints only — no app code, absent on hardware GL.

---

## Addendum 2 — Graduation cap 3D rebuild (2026-08-20)

GraduationCapScene rebuilt per the cap-rebuild spec: lathe crown with real
circular underside + inner cavity, gold trim ring + band, diamond beveled
board with thickness, gold cord + 14-strand merged tassel, five materials,
studio key/fill/rim + gold accent + PMREM RoomEnvironment, initial three-quarter
tilted presentation, slow idle spin. New `--cap-gold` token (light+dark);
fabric tokens shifted blue-black; CapEmblem fallback tassel uses `--cap-gold`.

### cap-rebuild-probe.mjs — 9/9 PASS (sharp pixel analysis of [data-cap-slot])

| Check | Result |
| --- | --- |
| Gold trim/cord/tassel present (light) | PASS (67.7k warm-gold px) |
| Dark blue-black fabric present (light) | PASS (64.8k px, ratio 0.137) |
| Cap silhouette fills slot | PASS (75% opaque) |
| Hero title + CTA not occluded | PASS (H1 / DIV hit-test, no cap-slot) |
| Reduced-motion static pose paints | PASS (canvas, wrapper opacity 1) |
| Reduced: gold still present | PASS (57.6k px) |
| Dark-theme switch re-tints | PASS (html.dark) |
| Dark: gold trim still visible | PASS (11.5k px — true trim signal, halo excluded) |
| No page/console errors | PASS |

### Regression (all suites re-run against the new scene)

- qa-stability.mjs 20/20 — 1 probe fix: D-reduced-cap-painted now polls for
  settle (fixed 3s measure raced the 0.6s+0.6s reduced hero fade under
  parallel-suite CPU contention; app behavior unchanged).
- qa-stability2.mjs 11/11.
- Lint 0/0, build clean, cap lazy chunk 8.8 kB (was 6.8; RoomEnvironment added).
- Screenshots: shots/cap-rebuild/cap-light.png, cap-dark.png, cap-reduced.png.
- Visual gate held: user approval of screenshots against the reference (image
  attachment was unreadable by the model; written spec used as the reference).

---

## Addendum 3 — Dev-vs-preview divergence: StrictMode context loss (2026-08-20)

**Symptoms (dev only, user-reported):** cap slot rendered as a warm glow with no
visible cap; login/register cards intermittently missing; repeated
`THREE.WebGLRenderer: Context Lost` console spam. Preview (production build)
always rendered correctly.

### Root cause (proven, not assumed)

1. **Pixel-diffed the cap slot** (sharp) on dev vs preview, both themes:
   - Dev: light mid-band gold 141,986 px / dark 0 px; slot reads warm-brown
     (~30% hero-background blend) — the cap was invisible against the glow.
   - Preview: light 97,985 / dark 10,076; fabric renders blue-black.
2. **Palette ruled out:** `--cap-*` tokens resolve identically in both servers
   (computed `#343b4c` board / `#b58a24` gold).
3. **StrictMode A/B** (temporary removal in `main.jsx`): dev without StrictMode
   matched preview pixel-for-pixel in both themes (light 97,166/10,316; dark
   42,878/67,290 vs preview 42,926/66,680). With StrictMode: corrupted colors
   + context-loss counters firing.
4. **Cause:** React 19 StrictMode double-mount + R3F 9.6.1 deferred unmount
   disposes the WebGL context and force-loses it on remount — pmndrs/
   react-three-fiber#3863. Materials then render with corrupted colors and the
   context dies (`Context Lost` spam). StrictMode is a dev-only no-op, which is
   why production never regressed.

### Fixes

1. **`main.jsx` — StrictMode removed** (root cause; documented with the issue
   reference in a comment; revert note if R3F ships a fix).
2. **`lib/three-engine.js` — `attachContextLoss(canvas, onLost, onRestored)`**
   — shared WebGL context-loss lifecycle (R3F 9.6.x has no handling); prevents
   default, reports lost/restored.
3. **`GraduationCapScene`** — context loss swaps in the `CapEmblem` fallback
   (cap slot is never a dead/warm-glow canvas), restores on context restore;
   PMREM `RoomEnvironment` texture now disposed on unmount (was leaking GPU
   memory per remount).
4. **`LivingCoreScene`** — context loss hides the decorative scene (auth UI
   unaffected), restores automatically.
5. **`PublicRoute`** — no longer gates auth pages behind the silent-bootstrap
   window: the card renders immediately and only redirects when a session is
   actually restored (previously up to ~5s of blank card area with a dead
   backend + stale cookie).

### Verification

- Dev (StrictMode off) == preview, both themes, cap slot banded pixel diff:
  light mid gold/dark 97,460/10,227 vs 97,985/10,076; dark 42,906/66,961 vs
  42,926/66,680.
- Auth routes in dev: `/login` 3 inputs + `/register` 5 inputs visible
  (opacity 1, hit-test INPUT/FORM), network bg at full width, 0 console errors.
- Suites re-run: cap-rebuild-probe 9/9, qa-stability 20/20, qa-stability2
  11/11 (preview); lint 0/0; build clean.
- R3F 9.7.0 was evaluated as an alternative fix but not upgraded — the
  StrictMode fix is proven; upgrade is documented as the follow-up if the
  upstream issue ships a real fix.