const FALLBACKS = {
  "--chart-1": "#E89B3C",
  "--chart-2": "#67C7E8",
  "--chart-3": "#A78BFA",
  "--chart-4": "#4ADE80",
  "--chart-5": "#FB7185",
  "--warning": "#F59E0B",
  "--destructive": "#EF4444",
  "--muted-foreground": "#94A3B8",
};

export function cssColor(variable) {
  if (typeof window === "undefined") return FALLBACKS[variable] ?? "";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return value || (FALLBACKS[variable] ?? "");
}

export function chartPalette() {
  return ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"].map(
    cssColor,
  );
}
