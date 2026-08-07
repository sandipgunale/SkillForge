import { Skeleton } from "@/components/ui/skeleton";

/* ==========================================================================
   PageLoader — Suspense fallback for lazy routes. A page-shaped shimmer
   skeleton (title + card grid), not a spinner. Reduced-motion pauses the
   shimmer via the global CSS kill-switch; the layout remains.
   ========================================================================== */

export default function PageLoader({ label = "Loading your workspace" }) {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-10"
      aria-busy="true"
      aria-label={label}
    >
      <div className="space-y-4">
        <Skeleton className="shimmer h-6 w-2/3 max-w-md" />
        <Skeleton className="shimmer h-4 w-1/3 max-w-xs" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border/60 bg-card/40 p-5"
          >
            <Skeleton className="shimmer size-10 rounded-xl" />
            <Skeleton className="shimmer mt-4 h-4 w-3/4" />
            <Skeleton className="shimmer mt-2 h-3 w-1/2" />
            <Skeleton className="shimmer mt-6 h-3 w-full" />
            <Skeleton className="shimmer mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}