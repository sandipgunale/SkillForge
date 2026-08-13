import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  useForgeFold — the single authoritative scroll controller for the         */
/*  Forge Fold landing.                                                        */
/*                                                                             */
/*  Native scroll over the measured section stack drives every transform      */
/*  directly on refs (no per-frame React state, no GSAP pinning, no           */
/*  ScrollTriggers — the fold owns the transforms, so nothing conflicts).     */
/*                                                                             */
/*  Geometry is measured dynamically: slot[i] = [slotTop, height] accumulated  */
/*  from each section's own offsetHeight, and the stage's height is set to    */
/*  the total. Nothing is hardcoded, so fonts, viewport changes, and content   */
/*  edits cannot desync the physics.                                           */
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
/*    rotateY   = -180·s deg  (around the right edge)                           */
/*    lift      = sin(s·π) · FLIP_LIFT   (3D depth, no margins)                */
/*    edge opacity  = sin(s·π) · EDGE_MAX (ember hairline on the hinge)        */
/*    cast opacity  = sin(sPrev·π) · CAST_MAX (shadow the turning page casts   */
/*                   on the next page)                                          */
/*                                                                             */
/*  Reduced motion: the hook does nothing — the static layout replaces the     */
/*  stage entirely.                                                             */
/* -------------------------------------------------------------------------- */

const SMOOTH_RATE = 10; /* convergence per second for scroll progress */
const FLIP_LIFT = 26; /* translateZ while swinging, px */
const CAST_MAX = 0.5; /* peak shadow opacity at 90° */
const EDGE_MAX = 0.55; /* peak ember hairline opacity at 90° */

function damp(delta, rate) {
  return 1 - Math.exp(-delta * rate);
}

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
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

    const measure = () => {
      const pages = pagesRef.current ?? [];
      if (!pages.length) return;
      let total = 0;
      slots = pages.map((page) => {
        const height = Math.max(
          page.sheet?.offsetHeight ?? 0,
          window.innerHeight,
        );
        const top = total;
        total += height;
        return { top, height };
      });
      stageHeight = total;
      stage.style.height = `${total}px`;
      /* Anchor markers: keep the navbar's hash links accurate while the
         sections are scroll-pinned. Each marker carries the id of the page
         that follows it in the DOM, so the browser's native hash scroll
         lands exactly on the measured slot top. */
      pages.forEach((page, index) => {
        if (page.id) {
          const marker = stage.querySelector(`[data-anchor="${page.id}"]`);
          if (marker) {
            marker.style.top = `${slots[index].top}px`;
          }
        }
      });
      /* Reset every page to the viewport-pin pose — safe after
         resize/remount. */
      applied = pages.map((page) => {
        const sheet = page.sheet;
        const cast = page.cast;
        const edge = page.edge;
        if (sheet) {
          sheet.style.transform = "translate3d(0, 0, 0)";
          sheet.style.visibility = "visible";
        }
        if (cast) cast.style.opacity = "0";
        if (edge) edge.style.opacity = "0";
        return { translate: 0, rotate: 0, lift: 0, cast: 0, edge: 0, s: 0 };
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

      for (let index = 0; index < count; index += 1) {
        const page = pages[index];
        const slot = slots[index];
        const prev = applied[index] ?? { s: 0 };
        const isLast = index === count - 1;

        /* Raw progress through this page's window. */
        const raw = clamp01((scrollY - slot.top) / slot.height);
        /* Smooth toward raw (reversible: same path both directions). */
        const s = isLast ? 0 : prev.s + (raw - prev.s) * f;
        /* The pin: every sheet rests at the stage top, so tracking the
           viewport keeps the current page flat at the top of the screen. */
        const translate = scrollY;

        const sin = Math.sin(s * Math.PI);
        const rotate = isLast ? 0 : -180 * s;
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
          /* Fully turned pages are hidden: never painted, never focused. */
          sheet.style.visibility = s > 0.999 ? "hidden" : "visible";
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
        };
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
    };
  }, [reduced, stageRef, pagesRef]);
}