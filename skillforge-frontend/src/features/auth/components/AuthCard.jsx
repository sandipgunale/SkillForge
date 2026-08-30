import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { GLOW, RADIUS_CLASS } from "@/lib/design-system";
import { useTilt, useReducedMotion } from "@/lib/motion-gsap";

/**
 * AuthCard — the "glass ceramic panel" of the auth experience.
 * Layered shadows, inner ember edge glow, gentle float, a soft
 * mouse-following reflection (light gliding across glass), a static
 * diagonal refraction sheen, and a subtle 3D tilt that springs back
 * naturally. Tilt is disabled under reduced motion.
 * NOTE: deliberately has NO entrance animation — the card must be visible
 * immediately and unconditionally; a gsap.from opacity gate would create an
 * invisibility window (see AuthLayout).
 */
export default function AuthCard({ children, className }) {
  const reduced = useReducedMotion();
  const cardRef = useRef(null);
  const tiltRef = useRef(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  useTilt(tiltRef, { max: 2.5 });

  const handleMove = (e) => {
    const rect = tiltRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlow({ x, y, opacity: 1 });
  };

  const handleLeave = () => {
    setGlow((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div ref={cardRef}>
      <div className="animate-float-subtle" style={{ perspective: 1200 }}>
        <div
          ref={tiltRef}
          onMouseMove={reduced ? undefined : handleMove}
          onMouseLeave={reduced ? undefined : handleLeave}
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
        </div>
      </div>
    </div>
  );
}