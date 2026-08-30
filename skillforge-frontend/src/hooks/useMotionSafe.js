import { useEffect, useState } from "react";

/**
 * Returns true when the user has NOT requested reduced motion.
 * Components use this to gate entrance animations and autoplay.
 */
export function useMotionSafe() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event) => setReduced(event.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return !reduced;
}
