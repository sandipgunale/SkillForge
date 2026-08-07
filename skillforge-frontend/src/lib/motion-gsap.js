import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { DURATION } from "./design-system";

/* ==========================================================================
   SkillForge Motion Engine — GSAP

   The single motion library for the app. AGENTS.md mandates GSAP as the
   primary animation engine, so all reveal choreography, scroll-driven
   timelines, and text animation move through this module.

   RULES
   - Every animation runs inside a gsap.context rooted at a component ref
     (`useMotionScope`) so it is fully reverted on unmount.
   - Every scroll timeline is hooked to ScrollTrigger (registered here).
   - Every entrance/Staggered reveal respects prefers-reduced-motion via
     useReducedMotion(); the content is simply left visible (no motion).
   - Timings/eases come from the design system; never inline magic numbers.

   framer-motion has been fully migrated into this module. ./motion.js is
   removed and framer-motion is no longer a dependency.
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger, SplitText);

/* GSAP easing names mirroring the design-system bezier curves. */
export const GSAP_EASE = {
  outExpo: "expo.out",
  inOutSoft: "power3.inOut",
  spring: "back.out(1.7)",
  smooth: "power2.out",
};

/* Durations (ms) from the design system, as seconds for GSAP. */
export const SECONDS = {
  entrance: DURATION.entrance / 1000,
  slow: DURATION.slow / 1000,
  base: DURATION.base / 1000,
  fast: DURATION.fast / 1000,
};

/** Live prefers-reduced-motion flag. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Reduced-motion + viewport defaults shared by reveal helpers. */
export function useMotionSafe() {
  const reduced = useReducedMotion();
  return { reduced, viewport: { once: true, margin: "-80px" } };
}

/**
 * Create a scope-safe GSAP context bound to a component ref. Kills every
 * tween/ScrollTrigger created inside the callback when the component unmounts.
 * The callback receives `{ gsap, select, context }` where `select` is a
 * selector function scoped to this ref.
 *
 *   import { useMotionScope } from "@/lib/motion-gsap";
 *   const root = useRef(null);
 *   useMotionScope(({ gsap, select }) => {
 *     gsap.from(select("> *"), { opacity: 0, y: 20, stagger: 0.08 });
 *   }, [deps], root);
 */
export function useMotionScope(callback, dependencies, root) {
  const internalRef = useRef(null);
  const scopeRef = root ?? internalRef;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!scopeRef.current) return undefined;
    let ctx = null;
    ctx = gsap.context(() => {
      const self = {
        gsap,
        context: ctx,
        select: (selector) =>
          Array.from(scopeRef.current?.querySelectorAll(selector) ?? []),
      };
      return callbackRef.current(self);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return scopeRef;
}

/**
 * Entrance reveal on scroll. Fades + rises elements that match `selector`
 * inside `scope` when they enter the viewport (staggered). Reduced-motion
 * renders everything immediately visible.
 *
 *   const root = useRef(null);
 *   useReveal(root, { targets: "> *", stagger: 0.08, y: 28 });
 */
export function useScrollShow(ref, { y = 24, stagger = 0.08, duration = SECONDS.slow } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const targets = ref.current.children;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 82%",
        once: true,
      },
    });

    tl.from(targets, {
      opacity: 0,
      y,
      duration,
      ease: GSAP_EASE.smooth,
      stagger,
      clearProps: "opacity,transform",
    });

    return () => {
      tl.kill();
    };
  }, [ref, reduced, y, stagger, duration]);
}

/* ==========================================================================
   Entrance / stagger primitives — GSAP equivalents of the former
   framer-motion motion.div variants. All obey useReducedMotion() (content
   stays visible, no tween) and are scoped/reverted through useMotionScope.
   ========================================================================== */

/**
 * Entrance reveal for a single element or its direct children (staggered).
 * Plays once on mount. Reduced-motion leaves content visible.
 *
 *   const ref = useRef(null);
 *   useReveal(ref, { y: 24 });                      // fade + rise the element
 *   useReveal(ref, { stagger: 0.08 });              // stagger direct children
 */
export function useReveal(
  ref,
  { y = 24, duration = SECONDS.base, ease = GSAP_EASE.outExpo, stagger = 0, delay = 0 } = {},
) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const targets = stagger
      ? Array.from(ref.current.children)
      : ref.current;

    const tween = gsap.from(targets, {
      opacity: 0,
      y,
      duration,
      delay,
      ease,
      stagger,
      clearProps: "opacity,transform",
    });

    return () => {
      tween.kill();
    };
  }, [ref, reduced, y, stagger, duration, ease, delay]);
}

/**
 * Chinese-style stagger reveal for list children growing on scroll.
 * Mirrors framer's staggerContainer/staggerChildren on the way in.
 */
export function useStaggerIn(
  ref,
  { target = "> *", y = 18, stagger = 0.08, duration = SECONDS.base } = {},
) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const targets = ref.current.querySelectorAll(target);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        once: true,
      },
    });

    timeline.from(targets, {
      opacity: 0,
      y,
      duration,
      ease: GSAP_EASE.outExpo,
      stagger,
      clearProps: "opacity,transform",
    });

    return () => {
      timeline.kill();
    };
  }, [ref, reduced, target, y, stagger, duration]);
}

/**
 * Mount/replay helper for state-keyed swaps (e.g. theme icon, question
 * counter, trailing form adornments). Plays an in-on-mount tween and
 * force-kills on unmount. Keyboard: runs like `gsap.from`, respecting
 * reduced-motion.
 */
export function useMountAnimation(
  ref,
  deps = [],
  { y = 0, scale = 1, scaleX = 1, opacity = true, blur, height, duration = SECONDS.fast, ease = GSAP_EASE.outExpo, delay = 0, onComplete, props } = {},
) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const from = { duration, ease, delay };
    if (y) from.y = y;
    if (scale !== 1) from.scale = scale;
    if (scaleX !== 1) from.scaleX = scaleX;
    if (opacity) from.opacity = 0;
    if (blur) from.filter = `blur(${blur}px)`;
    if (height !== undefined) from.height = height;
    if (props) Object.assign(from, props);

    const tween = gsap.from(ref.current, { ...from, onComplete });

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, y, scale, scaleX, opacity, blur, height, duration, ease, delay, ...deps]);
}

/** Entrance-only wrapper for small panels (search dropdown, tooltips). */
export function usePopover(ref, deps = []) {
  useMountAnimation(ref, deps, { y: -8, scale: 0.98, duration: 0.16 });
}

/**
 * Hover / tap micro-interactions scoped to the ref element. Mirrors the
 * Recreates the old framer-motion whileHover / whileTap spring feel with
 * GSAP ease. Respects
 * reduced-motion (no interactive scaling).
 *
 *   const ref = useRef(null);
 *   useMicroInteractions(ref, { hover: { scale: 1.05 }, tap: { scale: 0.96 } });
 */
export function useMicroInteractions(
  ref,
  { hover, tap, duration = SECONDS.fast, ease = GSAP_EASE.smooth } = {},
) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;

    const ctx = gsap.context(() => {
      const el = ref.current;

      const play = (vars) => {
        if (el) gsap.to(el, { ...vars, duration, ease, overwrite: "auto" });
      };

      if (hover) {
        el.addEventListener("mouseenter", () => play(hover));
        el.addEventListener("mouseleave", () => play({ scale: 1 }));
      }

      if (tap) {
        el.addEventListener("pointerdown", () => play(tap));
        el.addEventListener("pointerup", () => play({ scale: 1 }));
        el.addEventListener("pointerleave", () => play({ scale: 1 }));
      }
    }, ref);

    return () => ctx.revert();
  }, [reduced, ref, duration, ease, hover, tap]);
}

/**
 * Mouse-follow 3D tilt with a springy settle, mirroring framer's
 * useMotionValue + useSpring + useTransform combo on the auth panel.
 */
export function useTilt(ref, { max = 2.5 } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;
    const el = ref.current;

    let currentTween = null;

    const move = (e) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;

      if (currentTween) currentTween.kill();
      currentTween = gsap.to(el, {
        rotateX: my * -max * 2,
        rotateY: mx * max * 2,
        transformPerspective: 1200,
        duration: 0.3,
        ease: GSAP_EASE.smooth,
        overwrite: "auto",
      });
    };

    const leave = () => {
      currentTween = gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        transformPerspective: 1200,
        duration: 0.5,
        ease: GSAP_EASE.spring,
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      if (currentTween) currentTween.kill();
    };
  }, [reduced, ref, max]);
}

/**
 * SplitText line reveal for editorial headlines. Catches heading text into
 * wrapped lines and reveals them with a mask + rise on scroll.
 */
export function useSplitReveal(ref, { stagger = 0.08, duration = 0.9 } = {}) {
  const { reduced } = useMotionSafe();
  const state = useRef({ split: null, tl: null });

  useLayoutEffect(() => {
    if (reduced || !ref.current) return undefined;

    const split = new SplitText(ref.current, {
      type: "lines",
      linesClass: "split-line",
      mask: false,
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 82%",
        once: true,
        onEnter: () => tl.play(),
      },
      paused: true,
    });

    tl.from(
      split.lines,
      {
        opacity: 0,
        yPercent: 110,
        duration,
        ease: GSAP_EASE.outExpo,
        stagger,
      },
      0,
    );

    state.current = { split, tl };
    tl.play();

    return () => {
      tl.kill();
      if (state.current.split) state.current.split.revert();
      state.current = { split: null, tl: null };
    };
  }, [ref, reduced, stagger, duration]);

  return state;
}