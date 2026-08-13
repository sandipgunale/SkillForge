/* -------------------------------------------------------------------------- */
/*  PageBack — the decorative verso of every page, glimpsed as the leaf       */
/*  swings past 90°. Numeral + wordmark only: no content, no interaction.     */
/*  Wrapped in an aria-hidden face by BookLayer.                              */
/* -------------------------------------------------------------------------- */

export default function PageBack({ number, numeral }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-[8%] text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-[var(--book-rule)]">
        <span className="text-[clamp(1.3rem,3.4vh,2rem)] font-bold tabular-nums text-[var(--book-page-muted)]">
          {numeral ?? String(number).padStart(2, "0")}
        </span>
      </div>

      <div className="h-px w-12 bg-[var(--book-rule)]" />

      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[var(--book-page-muted)]">
        The craft of focused learning
      </p>
    </div>
  );
}
