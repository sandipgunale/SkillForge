import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { DURATION, GLOW, RADIUS_CLASS } from "@/lib/design-system";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * AuthCard — the "glass ceramic panel" of the auth experience.
 * Layered shadows, inner ember edge glow, gentle float, a soft
 * mouse-following reflection (light gliding across glass), a static
 * diagonal refraction sheen, and a subtle 3D tilt that springs back
 * naturally. Tilt is disabled under reduced motion.
 */
export default function AuthCard({ children, className }) {
  const ref = useRef(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [2.5, -2.5]), {
    stiffness: 130,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-2.5, 2.5]), {
    stiffness: 130,
    damping: 18,
  });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setGlow({ x, y, opacity: 1 });
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    setGlow((g) => ({ ...g, opacity: 0 }));
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: DURATION.entrance / 1000, ease: EASE_OUT_EXPO, delay: 0.05 }}
    >
      <div className="animate-float-subtle" style={{ perspective: 1200 }}>
        <motion.div
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={
            reducedMotion
              ? undefined
              : { rotateX, rotateY, transformStyle: "preserve-3d" }
          }
          className={cn(
            "glass-strong relative overflow-hidden",
            RADIUS_CLASS["3xl"],
            className,
          )}
        >
          {/* Cursor-following reflection — light gliding across the panel
              (the static sheen + light scattering lives in the glass CSS) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              opacity: glow.opacity,
              "--glow-x": `${glow.x}%`,
              "--glow-y": `${glow.y}%`,
              background: GLOW.reflection,
            }}
          />

          <div className="relative z-20">{children}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
