/* -------------------------------------------------------------------------- */
/*  Typography presets for the Foundry Precision landing — the shared source  */
/*  (see DESIGN.md → Landing). Kept outside component files so every module   */
/*  stays fast-refresh clean.                                                  */
/* -------------------------------------------------------------------------- */

export const T = {
  /* Editorial mono section label */
  label: "font-lp-mono text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-lp-accent",
  /* Display headlines — Cabinet Grotesk, fluid clamp, tight tracking */
  h2: "font-lp-display text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.02em]",
  h3: "font-lp-display text-[clamp(1.25rem,2.4vw,1.625rem)] font-bold leading-[1.12] tracking-[-0.01em]",
  /* Body copy */
  body: "text-base leading-relaxed text-lp-muted",
  small: "text-sm leading-relaxed",
  /* Panels — hairline frame, flat surface (no glass, no bubbles) */
  panel: "lp-panel",
  chip: "rounded-full border border-lp-border px-3.5 py-1.5 font-lp-mono text-[0.6875rem] uppercase tracking-[0.16em] text-lp-muted",
  /* Large CTAs — the two approved button treatments */
  ctaPrimary: "lp-glow h-12 w-full rounded-[4px] bg-lp-accent px-7 text-base font-semibold text-lp-accent-ink transition-colors hover:bg-lp-accent-strong sm:w-auto",
  ctaOutline: "h-12 w-full rounded-[4px] border-lp-border-strong bg-transparent px-7 text-base font-semibold text-lp-text transition-colors hover:border-lp-accent hover:text-lp-accent sm:w-auto",
};