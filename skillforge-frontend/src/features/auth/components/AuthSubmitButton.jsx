import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import Spinner from "@/components/common/Spinner";
import { COMPONENT, DURATION, SHADOW } from "@/lib/design-system";
import { useMicroInteractions, useMountAnimation, useReducedMotion } from "@/lib/motion-gsap";

/**
 * AuthSubmitButton — the forge's signature action.
 * Ember gradient with a light sweep on hover, a ripple on click,
 * and a morphing spine: idle -> spinner pill -> success check.
 */
export default function AuthSubmitButton({
  status = "idle",
  children,
  className,
  disabled,
  ...props
}) {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);
  const buttonRef = useRef(null);
  const spineRef = useRef(null);

  useMicroInteractions(buttonRef, {
    tap: status === "idle" ? { scale: 0.985 } : { scale: 1 },
  });

  useMountAnimation(spineRef, [status], { y: 6, duration: DURATION.base / 1000 });

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = idRef.current++;
    const size = Math.max(rect.width, rect.height);

    setRipples((r) => [...r, { id, x, y, size }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rip) => rip.id !== id));
    }, DURATION.ripple);
  };

  return (
    <button
      ref={buttonRef}
      type="submit"
      onPointerDown={handlePointerDown}
      disabled={disabled || status !== "idle"}
      aria-busy={status === "loading"}
      className={cn(
        "group relative flex w-full items-center justify-center overflow-hidden",
        COMPONENT.cta.size,
        COMPONENT.cta.radius,
        "bg-gradient-to-br from-ember via-ember to-ember/85 text-primary-foreground",
        "font-bold tracking-wide",
        SHADOW.raised,
        "transition-shadow duration-300",
        SHADOW.raisedHover,
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-90",
        status === "loading" && "w-full cursor-wait",
        className,
      )}
      {...props}
    >
      {/* Light sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-500 ease-out group-hover:translate-x-full group-hover:opacity-100"
        style={{ backgroundSize: "200% 100%" }}
      />

      {/* Ripple fragments — GSAP bursts, no exit needed (tween fades to zero) */}
      {ripples.map((rip) => (
        <Ripple key={rip.id} rip={rip} />
      ))}

      {/* Morphing spine */}
      <div ref={spineRef} className="flex items-center justify-center">
        {status === "idle" && (
          <span className="flex items-center gap-2">
            {children}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        )}

        {status === "loading" && (
          <span className="flex items-center gap-2">
            <Spinner className="size-4" />
            {children}
          </span>
        )}

        {status === "success" && (
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-success text-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span>Success</span>
          </span>
        )}
      </div>
    </button>
  );
}

/** One ripple burst — grows and fades out on a GSAP tween, then unmounts. */
function Ripple({ rip }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    const tween = gsap.fromTo(
      el,
      { scale: 0, opacity: 0.35 },
      { scale: 1, opacity: 0, duration: DURATION.ripple / 1000, ease: "easeOut" },
    );

    return () => tween.kill();
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full bg-white/30"
      style={{
        left: rip.x - rip.size / 2,
        top: rip.y - rip.size / 2,
        width: rip.size,
        height: rip.size,
      }}
    />
  );
}
