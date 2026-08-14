import { useEffect, useRef } from "react";

import { measureSlots, rawProgress, resolveState } from "./geometry";

/* -------------------------------------------------------------------------- */
/*  useForgeFold — the single authoritative scroll controller for the         */
/*  Forge Fold landing.                                                        */
/*                                                                             */
/*  Native scroll over the measured section stack drives every transform      */
/*  directly on refs (no per-frame React state, no GSAP pinning, no           */
/*  ScrollTriggers — the fold owns the transforms, so nothing conflicts).     */
/*                                                                             */
/*  Geometry comes from ./geometry — the shared slot model (measured, never   */
/*  hardcoded) also consumed by ScrollProgress, so the readout and the        */
/*  physics can never disagree about the active section.                      */
/*                                                                             */
/*  Every sheet rests at the stage top (absolute, top 0), so the pin IS the   */
/*  translate: translate = scrollY glues every page to the viewport top —     */
/*  the z-index stack (deterministic N - i) decides what you see, the         */
/*  rotation decides what's turning away, and fully turned pages go hidden.   */
/*  Anchor positions (scrollY = slot.top) therefore show the right section    */
/*  flat at the top of the screen. The last page never rotates — there is     */
/*  nothing beneath it to reveal.                                              */
/*                                                                             */
/*  Each page i:                                                                */
/*    raw  = clamp01((scrollY - slotTop[i]) / height[i])                       */
/*    s    = smoothed(raw)  — the single smoothing mechanism (reversible,      */
/*           fast-scroll safe)                                                  */
/*    translate = scrollY     (the pin — every page tracks the viewport)       */
/*    rotateY   = -180·E(s) deg, E = easeInOutSine  (around the right edge)    */
/*    lift      = sin(s·π) · FLIP_LIFT   (3D depth, no margins)                */
/*    edge opacity  = sin(s·π) · EDGE_MAX (ember hairline on the hinge)        */
/*    cast opacity  = sin(sPrev·π) · CAST_MAX (shadow the turning page casts   */
/*                   on the next page)                                          */
/*                                                                             */
/*  Robustness: the visibility pair is established SYNCHRONOUSLY inside        */
/*  measure() (before the first paint — no stacked-page flash, even on        */
/*  mid-page refresh), sheets are re-measured on resize, font readiness,      */
/*  AND content size changes (ResizeObserver), and a bounded retry waits      */
/*  for refs that mount late. Dev builds expose the live state on             */
/*  window.__FORGE_DEBUG__ for diagnostics.                                    */
/*                                                                             */
/*  Reduced motion: the hook does nothing — the static layout replaces the    */
/*  stage entirely.                                                             */
/* -------------------------------------------------------------------------- */

const SMOOTH_RATE = 10; /* convergence per second for scroll progress */
const FLIP_LIFT = 26; /* translateZ while swinging, px */
const CAST_MAX = 0.5; /* peak shadow opacity at 90° */
const EDGE_MAX = 0.55; /* peak ember hairline opacity at 90° */

function damp(delta, rate) {
  return 1 - Math.exp(-delta * rate);
}

export default function useForgeFold({ stageRef, pagesRef, reduced }) {
  const stateRef = useRef({ scrollY: 0, dirty: false });

  useEffect(() => {
    if (reduced) return undefined;

    const stage = stageRef.current;
    if (!stage) return undefined;

    let slots = [];
    let stageHeight = 0;
    let rafId = 0;
    let lastTime = performance.now();
    let applied = [];
    let retries = 0;
    let ro = null;
    const observedSheets = new Set();

    const measure = () => {
      const pages = pagesRef.current ?? [];
      const { slots: nextSlots, total } = measureSlots(stage);
      if (!nextSlots.length) {
        /* Refs can mount late (concurrent rendering, deferred children):
           retry for a bounded number of frames instead of leaving the
           stage height unset. */
        if (retries < 240) {
          retries += 1;
          requestAnimationFrame(measure);
        }
        return;
      }
      retries = 0;
      slots = nextSlots;
      stageHeight = total;
      stage.style.height = `${total}px`;

      /* Anchor markers: keep the navbar's hash links accurate while the
         sections are scroll-pinned. Each marker carries the id of the page
         that follows it in the DOM, so the browser's native hash scroll
         lands exactly on the measured slot top. */
      pages.forEach((page, index) => {
        if (page.id) {
          const marker = stage.querySelector(`[data-anchor="${page.id}"]`);
          if (marker) marker.style.top = `${slots[index].top}px`;
        }
      });

      /* Re-measure on content-driven sheet size changes (accordions, image
         loads, anything that reflows a page after mount). */
      if (!ro) {
        ro = new ResizeObserver(() => {
          measure();
          stateRef.current.dirty = true;
        });
      }
      pages.forEach((page) => {
        if (page.sheet && !observedSheets.has(page.sheet)) {
          observedSheets.add(page.sheet);
          ro.observe(page.sheet);
        }
      });

      /* Reset every page to the viewport-pin pose — safe after
         resize/remount — AND establish the visibility pair synchronously
         from the current scroll position, so the very first painted frame
         (and any mid-page refresh) already shows exactly the right page:
         no stacked-page flash, ever. */
      const state = resolveState(slots, window.scrollY);
      const turning = state.progress > 0.005;
      applied = pages.map((page, index) => {
        const sheet = page.sheet;
        const cast = page.cast;
        const edge = page.edge;
        const visible =
          index === state.current || (index === state.next && turning);
        if (sheet) {
          sheet.style.transform = "translate3d(0, 0, 0)";
          sheet.style.visibility = visible ? "visible" : "hidden";
        }
        if (cast) cast.style.opacity = "0";
        if (edge) edge.style.opacity = "0";
        return {
          translate: 0,
          rotate: 0,
          lift: 0,
          cast: 0,
          edge: 0,
          s: 0,
          visible,
        };
      });
    };

    const apply = (delta) => {
      const pages = pagesRef.current ?? [];
      const scrollY = window.scrollY;
      const count = pages.length;
      if (!count) return;

      /* The fold is over — nothing left to move. */
      if (scrollY > stageHeight + window.innerHeight) {
        stateRef.current.dirty = false;
        return;
      }

      const f = damp(delta, SMOOTH_RATE);
      let changed = false;

      /* Pass 1 — raw + smoothed progress through every page's scroll window.
         Raw is the geometric truth; smoothing only shapes the turn visuals
         (rotation/lift/edge/cast). The page-selection below MUST use raw —
         a smoothed "fully turned" test would leave the wrong page visible
         for ~1s after any fast scroll (the entrance would play under a
         hidden sheet and the arrival would be missed). */
      const sList = pages.map((page, index) => {
        const prev = applied[index] ?? { s: 0 };
        const isLast = index === count - 1;
        const raw = rawProgress(slots, scrollY, index);
        const s = isLast ? 0 : prev.s + (raw - prev.s) * f;
        return s;
      });

      /* The active surface comes from the shared decision function: the
         first page that hasn't fully turned (raw — not smoothed — so
         visibility is exact the instant scroll lands). Only it — and the
         page beneath it while it is actually swinging — is ever visible;
         every other sheet stays hidden, so stacked pages can never leak
         through one another. */
      const state = resolveState(slots, scrollY);
      const current = state.current;
      const turning = state.progress > 0.005;

      for (let index = 0; index < count; index += 1) {
        const page = pages[index];
        const prev = applied[index] ?? { s: 0 };
        const isLast = index === count - 1;
        const s = sList[index];

        const visible = index === current || (index === current + 1 && turning);

        /* The pin: every sheet rests at the stage top, so tracking the
           viewport keeps the current page flat at the top of the screen. */
        const translate = scrollY;

        const sin = Math.sin(s * Math.PI);
        /* The rotation is eased (ease-in-out-sine) so the page breaks away
           gently, sweeps decisively through the edge-on 90° moment, then
           settles softly onto the page beneath. Lift, edge, and cast stay
           tied to sin(s·π), so they still peak exactly at the edge-on
           instant. Deterministic and reversible — same path both ways. */
        const rotate = isLast
          ? 0
          : -180 * (0.5 - 0.5 * Math.cos(Math.PI * s));
        const lift = !isLast && s > 0 && s < 1 ? sin * FLIP_LIFT : 0;
        const edge = isLast ? 0 : sin * EDGE_MAX;
        const cast = sin * CAST_MAX;

        const tChanged =
          prev.s !== s || prev.translate !== translate || prev.lift !== lift;
        if (tChanged) changed = true;

        const sheet = page.sheet;
        if (sheet && tChanged) {
          /* The translate IS the pin (pages rest at the stage top); the
             rotate/lift only appear while the page swings. */
          const transform =
            s > 0.0005
              ? `translate3d(0, ${translate}px, ${lift}px) rotateY(${rotate}deg)`
              : `translate3d(0, ${translate}px, 0)`;
          sheet.style.transform = transform;
        }
        /* Visibility is the architectural guard, not a transform side
           effect: it is applied every frame the decision changes, so at
           rest only the hero (and nothing else) is ever painted. */
        if (sheet && prev.visible !== visible) {
          sheet.style.visibility = visible ? "visible" : "hidden";
        }

        if (page.edge && edge !== prev.edge) {
          page.edge.style.opacity = edge.toFixed(3);
          changed = true;
        }

        /* This page's cast reflects the page ABOVE it swinging over. */
        const castOpacity =
          index > 0 && applied[index - 1] ? applied[index - 1].cast : 0;
        if (page.cast && castOpacity !== prev.cast) {
          page.cast.style.opacity = castOpacity.toFixed(3);
        }

        applied[index] = {
          s,
          translate,
          rotate,
          lift,
          edge,
          cast,
          visible,
        };
      }

      if (import.meta.env.DEV) {
        const dbg = window.__FORGE_DEBUG__ ?? (window.__FORGE_DEBUG__ = {});
        dbg.stageHeight = stageHeight;
        dbg.viewportHeight = window.innerHeight;
        dbg.sectionCount = count;
        dbg.sectionHeights = slots.map((s) => s.height);
        dbg.scrollY = scrollY;
        dbg.currentIndex = current;
        dbg.nextIndex = state.next;
        dbg.progress = Number(state.progress.toFixed(4));
        dbg.direction =
          scrollY > stateRef.current.scrollY
            ? 1
            : scrollY < stateRef.current.scrollY
              ? -1
              : dbg.direction ?? 0;
      }

      stateRef.current.dirty = changed;
    };

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const scrolled = window.scrollY !== stateRef.current.scrollY;
      stateRef.current.scrollY = window.scrollY;
      if (scrolled || stateRef.current.dirty) apply(delta);
    };

    const onResize = () => {
      measure();
      stateRef.current.dirty = true;
    };

    measure();
    /* Force one apply on the very first frame (before the first paint)
       so the pin pose is established immediately. */
    stateRef.current.dirty = true;
    stateRef.current.scrollY = window.scrollY;
    rafId = requestAnimationFrame(loop);

    window.addEventListener("resize", onResize, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (rafId) {
          measure();
          stateRef.current.dirty = true;
        }
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      window.removeEventListener("resize", onResize);
      if (ro) {
        ro.disconnect();
        ro = null;
      }
      observedSheets.clear();
    };
  }, [reduced, stageRef, pagesRef]);
}
