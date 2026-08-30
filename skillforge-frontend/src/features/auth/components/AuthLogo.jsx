import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { COMPONENT, SURFACE } from "@/lib/design-system";
import { useReducedMotion } from "@/lib/motion-gsap";

import { ROUTES } from "@/constants/routes";

import LogoMark from "@/components/common/LogoMark";

/**
 * AuthLogo — breathing flame mark.
 * The ambient breathe uses the design-token keyframe (animate-logo-breathe);
 * hover tilts the whole mark with a springy GSAP settle.
 */
export default function AuthLogo({ size = "md", showWordmark = true }) {
  const flags = size === "lg" ? COMPONENT.logo.lg : COMPONENT.logo.md;
  const reduced = useReducedMotion();
  const hoverRef = useRef(null);

  useEffect(() => {
    const el = hoverRef.current;
    if (!el || reduced) return undefined;

    const tween = gsap.to(el, { scale: 1.06, rotate: -4 });
    tween.pause();

    const enter = () => tween.play();
    const leave = () => tween.reverse();

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
      tween.kill();
    };
  }, [reduced]);

  return (
    <Link
      to={ROUTES.HOME}
      className="group inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label="SkillForge home"
    >
      <div ref={hoverRef} className="relative will-change-transform">
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-ember/40 blur-xl transition-opacity duration-300",
            "opacity-60 group-hover:opacity-100",
            flags.tile,
          )}
        />
        <div
          className={cn(
            "animate-logo-breathe motion-reduce:animate-none",
            "relative flex items-center justify-center shadow-lg shadow-ember/25",
            SURFACE.emberTile,
            flags.tile,
          )}
        >
          <LogoMark className={flags.icon} />
        </div>
      </div>

      {showWordmark && (
        <span className="display text-lg font-bold tracking-tight text-foreground">
          SkillForge
        </span>
      )}
    </Link>
  );
}