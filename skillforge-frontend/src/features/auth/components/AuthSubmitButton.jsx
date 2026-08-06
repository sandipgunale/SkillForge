import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPONENT, DURATION, SHADOW } from "@/lib/design-system";
import { EASE_OUT_EXPO, SPRING_TACTILE } from "@/lib/motion";

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
    <motion.button
      type="submit"
      onPointerDown={handlePointerDown}
      disabled={disabled || status !== "idle"}
      whileTap={{ scale: status === "idle" ? 0.985 : 1 }}
      transition={SPRING_TACTILE}
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

      {/* Ripple fragments */}
      <AnimatePresence>
        {ripples.map((rip) => (
          <motion.span
            key={rip.id}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ripple / 1000, ease: "easeOut" }}
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{
              left: rip.x - rip.size / 2,
              top: rip.y - rip.size / 2,
              width: rip.size,
              height: rip.size,
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DURATION.base / 1000, ease: EASE_OUT_EXPO }}
            className="flex items-center gap-2"
          >
            {children}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.span>
        )}

        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: DURATION.base / 1000, ease: EASE_OUT_EXPO }}
            className="flex items-center gap-2"
          >
            <Loader2 className="size-4 animate-spin" />
            {children}
          </motion.span>
        )}

        {status === "success" && (
          <motion.span
            key="success"
            initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={SPRING_TACTILE}
            className="flex items-center gap-2"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-success text-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span>Success</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}