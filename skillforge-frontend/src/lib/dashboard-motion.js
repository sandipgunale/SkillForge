import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { GSAP_EASE } from "@/lib/motion-gsap";
import { useMotionSafe } from "@/lib/motion-gsap";

/* useMagnetic lives in motion-gsap.js (the single motion library); this
   module re-exports it so dashboard call sites keep their import. */
export { useMagnetic } from "@/lib/motion-gsap";

/* ==========================================================================
   SkillForge Dashboard Motion Engine — the single motion layer for Mission
   Control. Page enters, counters and zone reveals live here and are reused
   across the dashboard.

   - `usePageEnter`    — page-level entrance choreography
   - `useCount`        — eased counters driven by IntersectionObserver
   - `useMagnetic`     — magnetic hover pull (re-exported from motion-gsap)

   Reduced-motion renders everything instantly (callers gate content).
   ========================================================================== */

/**
 * Page enter — a single reveal over `[data-enter]` elements. Runs once on
 * mount regardless of scroll position; harmless with `once` ScrollTrigger.
 */
export function usePageEnter(scopeRef, { stagger = 0.07 } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !scopeRef.current) return undefined;
    const timeline = gsap.timeline({ defaults: { ease: GSAP_EASE.outExpo } });
    timeline.from(scopeRef.current.querySelectorAll("[data-enter]"), {
      opacity: 0,
      y: 24,
      duration: 0.55,
      stagger,
      clearProps: "opacity,transform",
    });
    return () => timeline.kill();
  }, [reduced, scopeRef, stagger]);
}

/**
 * Attach an eased counter to `ref` when it becomes visible. Writes formatted
 * text into the element; show the final value instantly under reduced motion.
 */
export function useCount(ref, to, { duration = 1.2, decimals = 0 } = {}) {
  const { reduced } = useMotionSafe();
  const state = useRef({ started: false, raf: 0, current: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const st = state.current;

    const render = () => {
      el.textContent = st.current.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    if (reduced) {
      st.current = to;
      render();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || st.started) return;
        st.started = true;
        const startAt = performance.now();
        const durationMs = duration * 1000;
        const tick = (now) => {
          const progress = Math.min((now - startAt) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          st.current = to * eased;
          render();
          if (progress < 1) {
            st.raf = requestAnimationFrame(tick);
          }
        };
        st.raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(st.raf);
      st.started = false;
    };
  }, [ref, to, duration, decimals, reduced]);
}