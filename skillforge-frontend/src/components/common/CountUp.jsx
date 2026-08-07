import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion-gsap";

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
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!ref.current) return undefined;

    let frameId;
    const durationMs = reducedMotion ? 0 : duration * 1000;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = reducedMotion ? 1 : 1 - Math.pow(1 - progress, 3);
          setValue(to * eased);
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      },
      { once: true, rootMargin: "-40px" },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [to, duration, reducedMotion]);

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