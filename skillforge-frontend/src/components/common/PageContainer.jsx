import { cn } from "@/lib/utils";

/* ==========================================================================
   PageContainer — the primary layout primitive for feature pages.
   `size` controls the horizontal measure: narrow (forms), wide (lists).
   ========================================================================== */

const SIZES = {
  narrow: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-none",
};

export default function PageContainer({ children, className, size = "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-10",
        SIZES[size] ?? SIZES.wide,
        className,
      )}
    >
      {children}
    </div>
  );
}