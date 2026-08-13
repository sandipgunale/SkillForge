/* -------------------------------------------------------------------------- */
/*  Page typography — vh-scaled editorial styles shared by every book page.   */
/*  The book is height-constrained, so all type scales off the viewport       */
/*  height (clamp) instead of fixed rem values.                               */
/* -------------------------------------------------------------------------- */

const MU = "text-[var(--book-page-muted)]";

export const PAGE = {
  /* Chapter heading inside openers */
  h2: "display text-[clamp(1.4rem,3.4vh,2.2rem)] font-bold leading-tight",
  /* Sub-heading on feature pages */
  h3: "text-[clamp(1rem,2.4vh,1.4rem)] font-bold tracking-tight",
  /* Body copy */
  body: "text-[clamp(0.78rem,1.9vh,0.95rem)] leading-relaxed",
  /* Small labels / captions */
  small: "text-[clamp(0.62rem,1.45vh,0.75rem)]",
  /* Muted color */
  muted: MU,
  /* Overline label */
  overline: "text-[clamp(0.6rem,1.4vh,0.7rem)] font-semibold uppercase tracking-[0.18em]",
  /* Hairline divider */
  rule: "h-px bg-[var(--book-rule)]",
  /* Ember accent */
  ember: "text-ember",
};
