import { cn } from "@/lib/utils";

/* ==========================================================================
   Spinner — the single branded loading indicator for buttons, dialogs and
   inline actions. An ember arc on a softed track (never a bare Loader2).
   Reduced-motion freezes it via the global CSS animation kill-switch.
   ========================================================================== */

export default function Spinner({ className, label }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="spinner size-4 shrink-0" aria-hidden="true" />
      {label ? (
        <span className="text-2xs font-medium text-muted-foreground">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  );
}