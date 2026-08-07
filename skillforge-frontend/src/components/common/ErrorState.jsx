import { AlertTriangle, RotateCcw, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ==========================================================================
   ErrorState — every error surface answers the same five questions:
   WHAT happened (explanation), WHY (diagnostic), HOW to recover (retry),
   and WHERE to get help. Reduced-motion safe by construction.
   ========================================================================== */

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Your data is safe — try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  helpHref,
  helpLabel = "Get help",
  diagnostic,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/40 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="relative mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
        <span
          className="absolute inset-0 -z-10 rounded-2xl bg-destructive/20 blur-xl"
          aria-hidden="true"
        />
      </span>

      <h3 className="display text-lg font-bold">{title}</h3>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {diagnostic && (
        <code className="mt-3 max-w-full truncate rounded-lg bg-muted px-2.5 py-1 text-2xs text-muted-foreground">
          {diagnostic}
        </code>
      )}

      {(onRetry || helpHref) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RotateCcw className="mr-2 size-3.5" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}

          {helpHref && (
            <Button asChild variant="ghost" size="sm">
              <a
                href={helpHref}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <LifeBuoy className="mr-2 size-3.5" aria-hidden="true" />
                {helpLabel}
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}