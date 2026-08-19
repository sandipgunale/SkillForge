import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

/* ==========================================================================
   Section identity builders — the choreography per declared identity.

   A builder receives { gsap, select, reset, root, tokens } and runs inside
   the section's gsap.context (scoped + reverted with the component). It owns
   its deterministic from-states (direct style writes — the P1-1 lesson, no
   clearProps) and returns nothing. Identities without a builder (mirror,
   quiet, …) keep their declared fallback behavior.

   The driver (`useSectionEntrance({ identity })` in useEntrance.js) resets
   all entrance slots before a builder runs, so a builder can rely on writing
   exactly the properties it animates.
   ========================================================================== */

/* Pre-hide = invisible AND out of the pointer/tab order: opacity alone
   leaves hidden CTAs clickable. Builders pair this with autoAlpha fromTo
   tweens, which restore visibility when the beat plays in. */
const preHideWrites = (els, styles) =>
  els.forEach((el) => {
    Object.entries(styles).forEach(([prop, value]) => {
      el.style[prop] = value;
      if (prop === "opacity" && value === "0") el.style.visibility = "hidden";
    });
  });

const chapterSlots = (select) => ({
  label: select("[data-entrance='label']"),
  head: select("[data-entrance='head']"),
  lead: select("[data-entrance='lead']"),
  content: select("[data-entrance='content']"),
  aside: select("[data-entrance='aside']"),
});

const chapterTrigger = (gsap, root) => ({
  scrollTrigger: { trigger: root, start: "top 78%", once: true },
});

const BUILDERS = {
  /* claim — the editorial statement: the display line rises under a clip
     mask, one layer at a time. */
  mask({ gsap, select, root }) {
    const slots = chapterSlots(select);
    if (!slots.head.length && !slots.label.length) return undefined;
    preHideWrites(slots.label, { opacity: "0", transform: "translateY(16px)" });
    preHideWrites(slots.head, {
      opacity: "0",
      transform: "translateY(44px)",
      clipPath: "inset(100% 0% 0% 0%)",
    });
    preHideWrites(slots.lead, { opacity: "0", transform: "translateY(24px)" });
    preHideWrites(slots.content, { opacity: "0", transform: "translateY(28px)" });
    preHideWrites(slots.aside, { opacity: "0", transform: "translateY(30px)" });

    const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.scene }, ...chapterTrigger(gsap, root) });
    if (slots.label.length) {
      tl.fromTo(slots.label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.05);
    }
    if (slots.head.length) {
      tl.fromTo(
        slots.head,
        { autoAlpha: 0, y: 44, clipPath: "inset(100% 0% 0% 0%)" },
        { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
        0,
      );
    }
    if (slots.lead.length) {
      tl.fromTo(slots.lead, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.12);
    }
    if (slots.content.length) {
      tl.fromTo(slots.content, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.18);
    }
    if (slots.aside.length) {
      tl.fromTo(slots.aside, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.18);
    }
    return undefined;
  },

  /* trust — claims resolve blur-to-focus, one row at a time. */
  blur({ gsap, select, root }) {
    const slots = chapterSlots(select);
    if (!slots.head.length && !slots.label.length) return undefined;
    const rows = select("[data-entrance='content'] > *");
    preHideWrites(slots.label, { opacity: "0", transform: "translateY(16px)" });
    preHideWrites(slots.head, { opacity: "0", filter: "blur(10px)" });
    preHideWrites(slots.lead, { opacity: "0", transform: "translateY(24px)" });
    preHideWrites(rows, {
      opacity: "0",
      transform: "translateY(18px)",
      filter: "blur(8px)",
    });

    const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.scene }, ...chapterTrigger(gsap, root) });
    if (slots.label.length) {
      tl.fromTo(slots.label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.05);
    }
    if (slots.head.length) {
      tl.fromTo(
        slots.head,
        { autoAlpha: 0, filter: "blur(10px)" },
        { autoAlpha: 1, filter: "blur(0px)", duration: 0.85 },
        0,
      );
    }
    if (slots.lead.length) {
      tl.fromTo(slots.lead, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.1);
    }
    if (rows.length) {
      tl.fromTo(
        rows,
        { autoAlpha: 0, y: 18, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.12 },
        0.18,
      );
    }
    return undefined;
  },

  /* machine — the framed panel opens with a wipe; chips light in sequence. */
  wipe({ gsap, select, root }) {
    const slots = chapterSlots(select);
    if (!slots.head.length && !slots.label.length) return undefined;
    const chips = select("[data-entrance='content'] > *");
    preHideWrites(slots.label, { opacity: "0", transform: "translateY(16px)" });
    preHideWrites(slots.head, { opacity: "0", transform: "translateY(40px)" });
    preHideWrites(slots.lead, { opacity: "0", transform: "translateY(24px)" });
    preHideWrites(chips, { opacity: "0", transform: "translateY(18px)" });
    preHideWrites(slots.aside, {
      opacity: "0",
      clipPath: "inset(0% 100% 0% 0%)",
    });

    const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.scene }, ...chapterTrigger(gsap, root) });
    if (slots.label.length) {
      tl.fromTo(slots.label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.05);
    }
    if (slots.head.length) {
      tl.fromTo(slots.head, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0);
    }
    if (slots.lead.length) {
      tl.fromTo(slots.lead, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.12);
    }
    if (chips.length) {
      tl.fromTo(
        chips,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
        0.18,
      );
    }
    if (slots.aside.length) {
      tl.fromTo(
        slots.aside,
        { autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" },
        { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
        0.1,
      );
    }
    return undefined;
  },

  /* proof — voices roll in one after another, settling each card. */
  quote({ gsap, select, root }) {
    const slots = chapterSlots(select);
    if (!slots.head.length && !slots.label.length) return undefined;
    const cards = select("[data-entrance='content'] > *");
    preHideWrites(slots.label, { opacity: "0", transform: "translateY(16px)" });
    preHideWrites(slots.head, { opacity: "0", transform: "translateY(40px)" });
    preHideWrites(cards, { opacity: "0", transform: "translateY(34px)" });

    const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.scene }, ...chapterTrigger(gsap, root) });
    if (slots.label.length) {
      tl.fromTo(slots.label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.05);
    }
    if (slots.head.length) {
      tl.fromTo(slots.head, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0);
    }
    if (cards.length) {
      tl.fromTo(
        cards,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.14, ease: GSAP_EASE.physical },
        0.16,
      );
    }
    return undefined;
  },
};

/**
 * Section motion registry — one named identity per landing section (and the
 * shell). Sections declare their identity; they never inline tweens. Entries
 * support `build` for registry-driven choreography (mask/blur/wipe/quote),
 * `presets`/`variant` for declarative choreography, and bespoke section
 * timelines (Arrival, Mastery, ForgeGraph) via `builder: true` — the escape
 * hatch that keeps the registry honest. See DESIGN.md "Motion Language".
 */
export const SECTION_MOTION = {
  wake: {
    builder: true,
    docs: "Hero: entrance beat sequence (0/100/250/400/500/600/1200ms) + cap 5-phase scroll + return-differently.",
  },
  claim: {
    build: BUILDERS.mask,
    docs: "Statements: oversized words rise with clip mask, one line at a time; keyword accent glint.",
  },
  trust: {
    build: BUILDERS.blur,
    docs: "Why: cards resolve blur-to-focus with shadow settle; checkmark line-draw micro-interaction.",
  },
  process: {
    build: null,
    variant: "numeral",
    docs: "How: step cards advance on scrub; connector line draws node-to-node; numerals roll 01->02->03.",
  },
  machine: {
    build: BUILDERS.wipe,
    nested: {
      formation: {
        docs: "ForgeGraph: nodes activate -> edges draw -> clusters form (once-assembly + edge draw-in).",
      },
    },
    docs: "Engine: panel reveals with mask wipe; shimmer travels; status ticks light sequentially.",
  },
  proof: {
    build: BUILDERS.quote,
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

  /* Layout effect: the scope ref is guaranteed attached and the from-state
     writes (preHide) land before first paint. Passive effects can race the
     ref attachment (the Engine section's entrance used to silently never
     run); synchronous refs are the contract here. */
  useLayoutEffect(() => {
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
      tween.kill();
    };
  }, [ref, reduced, y, scale, scaleX, opacity, blur, height, duration, ease, delay, onComplete, props, deps]);
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
 * layout reads); quickTo drives both axes; leave returns with the physical
 * (spring) token — magnetic spring-to-rest.
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
      /* Spring-to-rest: the return uses the physical token (back.out) so
         the CTA settles with a slight overshoot instead of a linear glide. */
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: MOTION_TOKENS.physical.duration,
        ease: GSAP_EASE.physical,
        overwrite: "auto",
      });
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
 * Spotlight hover — a radial glow tracks the pointer over a card. The
 * handler writes CSS vars only (`--spot-x`, `--spot-y`, `--spot-opacity`);
 * the visual comes from the `.lp-spotlight` utility's ::before. Rect is
 * cached on enter (no per-move layout reads); rAF-throttled writes; a
 * `:focus-visible` equivalent lights the glow at the card center.
 */
export function useSpotlight(ref) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    let raf = 0;
    let pending = null;
    let rect = null;
    const write = () => {
      raf = 0;
      if (!pending || !rect) return;
      el.style.setProperty("--spot-x", `${pending.x}px`);
      el.style.setProperty("--spot-y", `${pending.y}px`);
      el.style.setProperty("--spot-opacity", "1");
      pending = null;
    };
    const onMove = (e) => {
      pending = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!raf) raf = requestAnimationFrame(write);
    };
    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-opacity", "1");
    };
    const onLeave = () => {
      el.style.setProperty("--spot-opacity", "0");
      rect = null;
      pending = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onFocus = (e) => {
      if (!e.target.matches(":focus-visible")) return;
      rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${rect.width / 2}px`);
      el.style.setProperty("--spot-y", `${rect.height / 2}px`);
      el.style.setProperty("--spot-opacity", "1");
    };
    const onBlur = () => {
      el.style.setProperty("--spot-opacity", "0");
      pending = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, reduced]);
}

/**
 * Border trace — an SVG outline (child `[data-border-trace]`) draws itself
 * around a panel on hover. The svg must carry `pathLength="1"`; the hook
 * manages dasharray/dashoffset with the ui token. A `:focus-visible`
 * equivalent traces on keyboard focus. Disabled under reduced motion
 * (the border simply rests untraced; the panel's static border remains).
 */
export function useBorderTrace(ref) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return undefined;
    const path = el.querySelector("[data-border-trace]");
    if (!path) return undefined;
    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1 1";
    path.style.strokeDashoffset = "1";

    const trace = (offset) =>
      gsap.to(path, {
        strokeDashoffset: offset,
        duration: MOTION_TOKENS.ui.duration,
        ease: GSAP_EASE.ui,
        overwrite: "auto",
      });
    const onEnter = () => trace(0);
    const onLeave = () => trace(1);
    const onFocus = (e) => {
      if (e.target.matches(":focus-visible")) trace(0);
    };
    const onBlur = () => trace(1);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
      gsap.killTweensOf(path);
    };
  }, [ref, reduced]);
}

/**
 * Press physics — scale down on press, settle back on release. Pointer
 * events cover mouse, pen, and touch (tap = press). Micro token, reduced-
 * motion safe (no scale).
 */
export function usePressPhysics(ref, { scale = 0.97 } = {}) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return undefined;

    const press = () =>
      gsap.to(el, {
        scale,
        duration: MOTION_TOKENS.micro.duration,
        ease: GSAP_EASE.micro,
        overwrite: "auto",
      });
    const release = () =>
      gsap.to(el, {
        scale: 1,
        duration: MOTION_TOKENS.micro.duration,
        ease: GSAP_EASE.physical,
        overwrite: "auto",
        onComplete: () => gsap.set(el, { clearProps: "transform" }),
      });

    el.addEventListener("pointerdown", press);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointerleave", release);
    el.addEventListener("pointercancel", release);
    return () => {
      el.removeEventListener("pointerdown", press);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("pointercancel", release);
      gsap.killTweensOf(el);
    };
  }, [ref, reduced, scale]);
}

/**
 * Numeral roll — an eased counting animation for stat readouts. Writes
 * textContent (with optional padding/suffix) on a GSAP tween; reduced
 * motion jumps straight to the final value. App surfaces consume this
 * (quiz feedback, gamification count-ups, roadmap numerals); the landing
 * numerals stay scrub-driven.
 */
export function useNumeralRoll(
  ref,
  { to, duration = 1, pad = 0, suffix = "", ease = "power2.out", visible = true } = {},
) {
  const { reduced } = useMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return undefined;
    const format = (v) => String(Math.round(v)).padStart(pad, "0") + suffix;
    if (reduced) {
      el.textContent = format(to);
      return undefined;
    }
    const state = { v: 0 };
    const tween = gsap.to(state, {
      v: to,
      duration,
      ease,
      onUpdate: () => {
        el.textContent = format(state.v);
      },
    });
    return () => {
      tween.kill();
    };
  }, [ref, reduced, to, duration, pad, suffix, ease, visible]);
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