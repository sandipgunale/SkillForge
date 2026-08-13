/* -------------------------------------------------------------------------- */
/*  BookPage — shared page chrome for every book face.                        */
/*  Editorial frame: chapter label + running header, content area, and the    */
/*  page number on the outer margin (mirrored for left pages). All surfaces   */
/*  resolve --book-* tokens, so pages re-tint with the theme.                 */
/* -------------------------------------------------------------------------- */

export default function BookPage({
  chapter,
  number,
  total,
  side = "right",
  children,
  className = "",
}) {
  const numberAlign = side === "right" ? "justify-end" : "justify-start";

  return (
    <div
      className={`book-page-surface flex h-full flex-col px-[6%] py-[5%] ${className}`}
    >
      <header className="flex items-baseline justify-between gap-4">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--book-page-muted)]">
          {chapter}
        </p>
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[var(--book-page-muted)] opacity-70">
          SkillForge
        </p>
      </header>

      <div className="my-[3%] h-px bg-[var(--book-rule)]" />

      <div className="min-h-0 flex-1">{children}</div>

      <div className="mt-[3%] flex items-center justify-between gap-4">
        <p
          className={`text-[0.625rem] uppercase tracking-[0.18em] text-[var(--book-page-muted)] ${side === "right" ? "order-1" : "order-2"}`}
        >
          The craft of focused learning
        </p>
        <p
          className={`flex items-center gap-2 text-[0.6875rem] font-semibold tabular-nums text-[var(--book-page-muted)] ${numberAlign}`}
        >
          <span aria-hidden="true" className="h-px w-5 bg-[var(--book-rule)]" />
          <span>
            {String(number).padStart(2, "0")}
            <span className="opacity-60"> / {String(total).padStart(2, "0")}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
