import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * CountUp — animates a numeric value from 0 to `to` when scrolled into view.
 * Respects reduced-motion by rendering the final value immediately.
 */
export default function CountUp({
  to,
  duration = 1.4,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frameId;
    const start = performance.now();
    const durationMs = reducedMotion ? 0 : duration * 1000;

    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = reducedMotion ? 1 : 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, to, duration, reducedMotion]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}