import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { useMotionSafe } from "@/lib/motion-gsap";
import { GSAP_EASE } from "@/lib/motion-gsap";

/* ==========================================================================
   SkillForge Dashboard Motion Engine — the single motion layer for Mission
   Control. All widget/zone animation, page enters, counters, tilt and
   magnetic interactions live here and are reused across the dashboard.

   - `useWidgetReveal` — staggered zone reveals on scroll (GSAP ScrollTrigger)
   - `usePageEnter`    — page-level entrance choreography
   - `useCount`        — eased counters driven by IntersectionObserver
   - `useTilt`         — pointer-tracked widget tilt (CSS-variable driven)
   - `useMagnetic`     — magnetic hover pull for links / actions

   Reduced-motion renders everything instantly (callers gate content).
   ========================================================================== */

export const PRESETS = {
  fade: { opacity: 0, y: 24, duration: 0.55, ease: GSAP_EASE.outExpo },
  rise: { opacity: 0, y: 40, duration: 0.7, ease: GSAP_EASE.outExpo },
  scale: { opacity: 0, scale: 0.96, duration: 0.6, ease: GSAP_EASE.smooth },
  card: { opacity: 0, y: 28, scale: 0.98, duration: 0.65, ease: GSAP_EASE.outExpo },
};

/**
 * Reveal `[data-widget]` children when the scope / trigger scrolls in with a
 * stagger. `preset` selects a PRESETS entry. Reduced-motion: no-op (content
 * is already visible).
 */
export function useWidgetReveal(
  scopeRef,
  { preset = "card", stagger = 0.09, trigger = null, start = "top 82%" } = {},
) {
  const { reduced } = useMotionSafe();
  const settings = PRESETS[preset] ?? PRESETS.card;

  useEffect(() => {
    if (reduced || !scopeRef.current) return undefined;
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger ?? scopeRef.current,
        start,
        once: true,
      },
    });
    timeline.from(scopeRef.current.querySelectorAll("[data-widget]"), {
      ...settings,
      stagger,
      clearProps: "opacity,transform",
    });
    return () => timeline.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, scopeRef, preset, stagger, trigger, start]);
}

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

/** Pointer-tracked tilt, written to `--tilt-x/y` CSS variables (perspective styled in CSS). */
export function useTilt(ref, { max = 6 } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const el = ref.current;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--tilt-x", `${px * max}deg`);
      el.style.setProperty("--tilt-y", `${-py * max}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, ref, reduced]);
}

/** Magnetic hover pull for links / avatars / buttons. GSAP-driven, cleaned up on unmount. */
export function useMagnetic(ref, { strength = 0.35, radius = 140 } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const el = ref.current;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) > radius) return;
      gsap.to(el, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.4,
        ease: GSAP_EASE.smooth,
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: GSAP_EASE.smooth });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [ref, strength, radius, reduced]);
}