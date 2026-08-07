/* ==========================================================================
   SkillForge Design System — "The Forge"
   --------------------------------------------------------------------------
   JS companion to the CSS token layer in src/index.css. Both share the
   same three-layer architecture: primitive -> semantic -> component.

   RULES
   - Never hardcode hex/oklch/rgba values in components.
   - Colors resolve to CSS variables so light/dark switching stays in CSS.
   - Use `alpha()` / `mix()` for transparency — never inline color-mix.
   - Class presets (TYPOGRAPHY, SURFACE, BORDER, ELEVATION, SHADOW, GLASS)
     are Tailwind utilities backed by the CSS variables.
   ========================================================================== */

/* ==========================================================================
   1. Primitives — raw brand values (resolved through CSS variables)
   ========================================================================== */

export const PRIMITIVES = {
  /* Pure white highlights — glass reflections must stay white in both
     themes; they are NOT theme-adaptive by design. */
  reflection: "rgba(255, 255, 255, 0.085)",
  sheen: "rgba(255, 255, 255, 0.05)",
  ripple: "rgba(255, 255, 255, 0.3)",
};

export const FONT = {
  sans: "'Geist Variable', sans-serif",
};

export const BRAND = {
  /* The identity: warm ember energy on deep ink focus. */
  ember: "var(--ember)",
  emberForeground: "var(--ember-foreground)",
  aurora: "var(--aurora)",
  auroraForeground: "var(--aurora-foreground)",
};

/* ==========================================================================
   2. Semantic — purpose-driven aliases of primitives
   ========================================================================== */

/* Colors — every entry maps to the matching CSS variable, so both themes
   resolve in one place. */
export const COLORS = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  ember: "var(--ember)",
  aurora: "var(--aurora)",
};

/** Opacity helper: `alpha("ember", 0.14)` -> `color-mix(in oklch, var(--ember) 14%, transparent)`. */
export function alpha(variable, opacity) {
  const name = variable.startsWith("--") ? variable : `--${variable}`;
  return `color-mix(in oklch, var(${name}) ${Math.round(opacity * 100)}%, transparent)`;
}

/** Mix helper: `mix("ember", 0.6, "aurora")` blends two variables. */
export function mix(first, weight, second) {
  const a = first.startsWith("--") ? first : `--${first}`;
  const b = second.startsWith("--") ? second : `--${second}`;
  return `color-mix(in oklch, var(${a}) ${Math.round(weight * 100)}%, var(${b}))`;
}

/* Spacing — px scale mirroring the Tailwind scale (4px base) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 64,
  section: 88,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

/* Radius — px resolution of the CSS --radius scale (0.7rem base) */
export const RADIUS = {
  sm: 7,
  md: 9,
  lg: 11,
  xl: 16,
  "2xl": 20,
  "3xl": 25,
  "4xl": 29,
  full: 9999,
};

/* Radius utilities — the canonical Tailwind classes for the scale above */
export const RADIUS_CLASS = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  "4xl": "rounded-4xl",
  full: "rounded-full",
};

/* ==========================================================================
   3. Component presets — Tailwind class compositions used across the app
   ========================================================================== */

/* Typography */
export const TYPOGRAPHY = {
  /* Editorial hero — very bold, tight negative tracking, fluid clamp */
  hero: "font-sans text-hero font-black tracking-hero text-balance",
  /* Editorial display — the biggest page-level statement */
  display: "font-sans text-display font-black tracking-display text-balance",
  /* Section title */
  title: "font-sans text-title font-bold tracking-display",
  /* Card title */
  cardTitle: "font-sans text-subtitle font-bold tracking-tight",
  /* Body copy */
  body: "text-body font-medium",
  /* Body copy, secondary */
  subtitle: "text-sm font-medium text-muted-foreground",
  /* Compact uppercase field label */
  label: "text-3xs font-semibold uppercase tracking-[0.12em]",
  /* Overline — canonical label above titles (replaces ad-hoc 13px) */
  overline: "text-overline font-semibold uppercase tracking-[0.18em] text-muted-foreground",
  /* Tiny helper text (strength bar, caps-lock hint) — color applied by caller */
  hint: "text-2xs font-medium",
  /* Form validation error */
  fieldError: "text-sm text-destructive",
  caption: "text-xs font-medium text-muted-foreground",
  link: "link-underline font-semibold text-primary transition-colors hover:text-ember",
  /* Monospace code */
  code: "font-mono text-overline leading-relaxed",
};

/* Surface colors — background utilities */
export const SURFACE = {
  card: "bg-card text-card-foreground",
  subtle: "bg-background/40",
  raised: "bg-background/60",
  popover: "bg-popover text-popover-foreground",
  muted: "bg-muted text-muted-foreground",
  emberTile: "bg-gradient-to-br from-ember via-ember to-aurora text-primary-foreground",
};

/* Border colors — input/divider/interactive borders */
export const BORDER = {
  base: "border-border",
  subtle: "border-foreground/10",
  input: "border-input",
  interactive: "hover:border-foreground/25",
  ember: "border-ember/60",
  destructive: "border-destructive/40",
};

/* Glass materials — blur + saturation + depth presets (CSS helpers) */
export const GLASS = {
  subtle: "glass",
  strong: "glass-strong",
  /* Field-level glass (inside panels) */
  field: "bg-background/40 backdrop-blur-sm",
  fieldRaised: "bg-background/60 backdrop-blur-sm",
};

/* Elevation — layered depth (CSS shadow variables) */
export const ELEVATION = {
  raised: "elevate",
  floating: "elevate-float",
  glass: "glass-strong",
  glassSubtle: "glass",
};

/* Shadow utilities — themed ember shadows for CTAs */
export const SHADOW = {
  subtle: "shadow-sm",
  raised: "shadow-lg shadow-ember/25",
  raisedHover: "hover:shadow-xl hover:shadow-ember/35",
};

/* Glow — reusable box-shadows built on the CSS variables */
export const GLOW = {
  /* Input focus ring — warm ember */
  focusEmber: `0 0 0 3px ${alpha("ember", 0.2)}`,
  /* Input focus ring — error state */
  focusDestructive: `0 0 0 3px ${alpha("destructive", 0.18)}`,
  /* Icon glow while a field is focused */
  icon: (opacity = 0.55, spread = 8) =>
    `0 0 ${spread}px ${alpha("ember", opacity)}`,
  /* Glass panel light reflection — tracks the cursor via --glow-x/--glow-y */
  reflection: `radial-gradient(340px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${PRIMITIVES.reflection} 0%, transparent 62%)`,
  /* Ambient halo behind glowing elements */
  soft: (opacity = 0.14, spread = 24) =>
    `0 0 ${spread}px ${alpha("ember", opacity)}`,
};

/* Animation — durations (ms) and easing curves, the single source of truth */
export const DURATION = {
  instant: 100,
  fast: 150,
  base: 250,
  slow: 450,
  slower: 700,
  /* Route/view transition */
  transition: 320,
  /* Auth card entrance */
  entrance: 800,
  /* Theme morph */
  morph: 600,
  /* Ripple decay */
  ripple: 600,
  /* Success morph hold before navigation */
  success: 750,
  /* Ambient loops */
  float: 9000,
  breathe: 6000,
  aurora: 18000,
  icon: 300,
};

/* Easing curves — cubic-bezier arrays; GSAP mirrors them in GSAP_EASE */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutSoft: [0.65, 0, 0.35, 1],
  spring: [0.34, 1.56, 0.64, 1],
};

/* ==========================================================================
   4. Component tokens — auth atoms (fields, CTA, icon tiles, logo)
   ========================================================================== */

export const COMPONENT = {
  field: {
    size: "h-14",
    radius: RADIUS_CLASS["2xl"],
    idle: `${GLASS.field} ${BORDER.base}`,
    focus: `${BORDER.ember} ${GLASS.fieldRaised}`,
    focusError: `${BORDER.destructive} ${GLASS.fieldRaised}`,
    error: BORDER.destructive,
    hover: BORDER.interactive,
  },
  cta: {
    size: "h-14",
    radius: RADIUS_CLASS["2xl"],
  },
  iconTile: {
    size: "size-14",
    radius: RADIUS_CLASS["2xl"],
  },
  logo: {
    md: {
      tile: "size-10 rounded-xl",
      icon: "size-5",
    },
    lg: {
      tile: "size-16 rounded-2xl",
      icon: "size-7",
    },
  },
};
