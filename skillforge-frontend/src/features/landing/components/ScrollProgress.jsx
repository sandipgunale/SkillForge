import { useEffect, useRef } from "react";

import {
  cachedSlots,
  invalidateSlots,
  resolveState,
} from "../experience/forge/geometry";
import { SECTIONS } from "../experience/forge/registry";

/* -------------------------------------------------------------------------- */
/*  ScrollProgress — minimal editorial progress chrome (right edge).           */
/*  Shows the current section as 01/09 with a thin ember progress line.       */
/*  One rAF-queued scroll listener writes straight to the DOM — never         */
/*  React state per frame. Works in both the Forge Fold stage and the static  */
/*  reduced-motion layout (each exposes its own scrollable stage root).       */
/*  The current section comes from the SAME measured slot geometry as the     */
/*  fold controller (./geometry) — one source of truth, so the readout can    */
/*  never disagree with what is actually on screen.                           */
/*  Purely decorative: pointer-events none, aria-hidden.                       */
/* -------------------------------------------------------------------------- */

const SECTION_COUNT = SECTIONS.length;

function stageRoot() {
  return (
    document.querySelector(".forge-fold") ??
    document.querySelector(".forge-static")
  );
}

export default function ScrollProgress() {
  const numRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const stage = stageRoot();
    if (!stage) return undefined;
    let raf = 0;

    /* Layout discipline: the slot model comes from the shared cache — the
       fold publishes measured geometry and only REAL changes (resize, font
       readiness) invalidate it here. A scroll frame never measures layout:
       the cache is either fresh or this frame is dropped for one invalidation
       pass. */
    const refresh = () => {
      invalidateSlots();
      update();
    };

    const update = () => {
      raf = 0;
      const { slots } = cachedSlots(stage);
      const { current, global } = resolveState(slots, window.scrollY);
      if (numRef.current) {
        const text = String(current + 1).padStart(2, "0");
        if (numRef.current.textContent !== text) {
          numRef.current.textContent = text;
        }
      }
      if (barRef.current) {
        const scale = `scaleY(${Math.max(0.001, global)})`;
        if (barRef.current.style.transform !== scale) {
          barRef.current.style.transform = scale;
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        refresh();
      });
    }
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      data-scroll-progress
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 right-5 z-40 hidden select-none flex-col items-end gap-2 md:flex"
    >
      <span className="font-mono text-3xs uppercase tracking-[0.18em] text-muted-foreground">
        <span ref={numRef}>01</span> / {String(SECTION_COUNT).padStart(2, "0")}
      </span>
      <span className="h-16 w-px overflow-hidden bg-border">
        <span
          ref={barRef}
          className="block h-full w-full origin-top bg-ember"
          style={{ transform: "scaleY(0.001)" }}
        />
      </span>
    </div>
  );
}
