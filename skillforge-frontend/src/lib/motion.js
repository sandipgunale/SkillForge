import { useReducedMotion } from "framer-motion";
import { EASE } from "./design-system";

/* Easings — single source of truth lives in the design system (src/lib/design-system.js) */
export const EASE_OUT_EXPO = EASE.outExpo;
export const EASE_SPRING = EASE.spring;
export const EASE_IN_OUT_SOFT = EASE.inOutSoft;

/** Spring presets for physical, tactile micro-interactions. */
export const SPRING_TACTILE = { type: "spring", stiffness: 420, damping: 26 };
export const SPRING_SOFT = { type: "spring", stiffness: 180, damping: 24 };
export const SPRING_BOUNCE = { type: "spring", stiffness: 300, damping: 14 };

/**
 * Shared, reduced-motion-aware page/view transitions.
 * Use `variants={fadeUp}` / `motion.div` directly.
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

/** Page-level transition for route changes (shared DNA with layouts). */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: EASE_OUT_EXPO },
};

/** Workhorse list stagger with a small configurable step. */
export const staggerList = (step = 0.06) => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: 0 } },
});

/** Single child of staggerList. */
export const staggerListItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

/** Returns motion-safe viewport transition defaults. */
export function useMotionSafe() {
  const prefersReducedMotion = useReducedMotion();
  return {
    reduced: prefersReducedMotion,
    viewport: { once: true, margin: "-80px" },
  };
}
