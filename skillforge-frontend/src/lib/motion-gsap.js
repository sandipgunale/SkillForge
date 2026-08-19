import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DURATION, MOTION } from "./design-system";

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

gsap.registerPlugin(ScrollTrigger);

/* GSAP easing names mirroring the design-system bezier curves. */
export const GSAP_EASE = {
  outExpo: "expo.out",
  inOutSoft: "power3.inOut",
  spring: "back.out(1.7)",
  smooth: "power2.out",
  /* Motion language categories (mirror of design-system MOTION.ease) */
  micro: "expo.out",
  ui: "expo.out",
  scene: "expo.out",
  physical: "back.out(1.7)",
};

/* Durations (ms) from the design system, as seconds for GSAP. */
export const SECONDS = {
  entrance: DURATION.entrance / 1000,
  slow: DURATION.slow / 1000,
  base: DURATION.base / 1000,
  fast: DURATION.fast / 1000,
};

/* Motion language categories in GSAP-ready form. Components declare intent
   (micro / ui / scene / physical), never raw durations or curves. Derived
   from the design-system MOTION mapping table — one source of truth. */
export const MOTION_TOKENS = {
  micro: { duration: MOTION.micro.duration / 1000, ease: GSAP_EASE.micro },
  ui: { duration: MOTION.ui.duration / 1000, ease: GSAP_EASE.ui },
  scene: { duration: MOTION.scene.duration / 1000, ease: GSAP_EASE.scene },
  physical: { duration: MOTION.physical.duration / 1000, ease: GSAP_EASE.physical },
};

/**
 * Section motion registry — one named identity per landing section (and the
 * shell). Sections declare their identity; they never inline tweens. Entries
 * support `presets`/`variant` for declarative choreography and `builder` for
 * bespoke timelines (Arrival, Mastery, ForgeGraph) — the escape hatch that
 * keeps the registry honest. See DESIGN.md "Motion Language".
 */
export const SECTION_MOTION = {
  wake: {
    builder: true,
    docs: "Hero: entrance beat sequence (0/100/250/400/500/600/1200ms) + cap 5-phase scroll + return-differently.",
  },
  claim: {
    variant: "mask",
    docs: "Statements: oversized words rise with clip mask, one line at a time; keyword accent glint.",
  },
  trust: {
    variant: "blur",
    docs: "Why: cards resolve blur-to-focus with shadow settle; checkmark line-draw micro-interaction.",
  },
  process: {
    variant: "numeral",
    docs: "How: step cards advance on scrub; connector line draws node-to-node; numerals roll 01->02->03.",
  },
  machine: {
    variant: "wipe",
    nested: {
      formation: {
        docs: "ForgeGraph: nodes activate -> edges draw -> clusters form (once-assembly + edge draw-in).",
      },
    },
    docs: "Engine: panel reveals with mask wipe; shimmer travels; status ticks light sequentially.",
  },
  proof: {
    variant: "quote",
    docs: "Experience: testimonial quotes roll vertically; star counts transition up.",
  },
  transformation: {
    builder: true,
    nested: {
      signature: {
        docs: "Knowledge Forge signature: fragmented -> structured -> personalized -> mastered (scrub-driven phases).",
      },
    },
    docs: "Mastery: dissolve -> reform as two distinct acts; copy resolves from scattered to focused; CTA magnetic.",
  },
  answers: {
    variant: "accordion",
    docs: "FAQ: press physics + chevron micro-rotate + answer fade; no layout animation.",
  },
  mirror: {
    docs: "Product showcase: reuses the app-component motion language.",
  },
  quiet: {
    static: true,
    docs: "Footer: static, no entrance choreography.",
  },
  shell: {
    docs: "Landing shell: navbar active-state, scroll progress, cursor (shared chrome identity).",
  },
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
      tween.revert();
    };
  }, [ref, reduced, y, stagger, duration, ease, delay]);
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
      tween.revert();
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
 * Magnetic pull for primary CTAs. The element eases toward the pointer
 * within a small radius and springs back on leave. Desktop fine pointers
 * only, disabled under prefers-reduced-motion. Restrained by design —
 * the pull is a whisper, not a tug. Rect is cached on enter (no per-move
 * layout reads); quickTo drives both axes.
 */
export function useMagnetic(ref, { strength = 0.35, radius = 140, max = null } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return undefined;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!fine || !wide) return undefined;

    const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: GSAP_EASE.smooth });
    const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: GSAP_EASE.smooth });

    let rect = null;

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };
    const onMove = (e) => {
      if (!rect) return;
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) > radius) return;
      const cap = max ?? Math.max(radius * 0.5, 1);
      toX(Math.max(-cap, Math.min(cap, dx * strength)));
      toY(Math.max(-cap, Math.min(cap, dy * strength)));
    };
    const onLeave = () => {
      toX(0);
      toY(0);
      rect = null;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [ref, reduced, strength, radius, max]);
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