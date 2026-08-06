import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { COMPONENT, DURATION, SURFACE } from "@/lib/design-system";

import { ROUTES } from "@/constants/routes";

/**
 * AuthLogo — breathing flame mark.
 * Breathes once every six seconds; on hover it glows and tilts slightly.
 */
export default function AuthLogo({ size = "md", showWordmark = true }) {
  const flags = size === "lg" ? COMPONENT.logo.lg : COMPONENT.logo.md;

  return (
    <Link
      to={ROUTES.HOME}
      className="group inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label="SkillForge home"
    >
      <motion.div
        animate={{ scale: [1, 0.94, 1] }}
        transition={{ duration: DURATION.breathe / 1000, ease: "easeInOut", repeat: Infinity }}
        whileHover={{ scale: 1.06, rotate: -5 }}
        className="relative"
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-ember/40 blur-xl transition-opacity duration-300",
            "opacity-60 group-hover:opacity-100",
            flags.tile,
          )}
        />
        <div className={cn("relative flex items-center justify-center shadow-lg shadow-ember/25", SURFACE.emberTile, flags.tile)}>
          <Flame className={flags.icon} strokeWidth={2.2} />
        </div>
      </motion.div>

      {showWordmark && (
        <span className="display text-lg font-bold tracking-tight text-foreground">
          SkillForge
        </span>
      )}
    </Link>
  );
}
