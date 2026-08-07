export const LEVELS = [
  { key: "BEGINNER", label: "Beginner", min: 0 },
  { key: "INTERMEDIATE", label: "Intermediate", min: 200 },
  { key: "ADVANCED", label: "Advanced", min: 500 },
  { key: "LEGEND", label: "Legend", min: 1000 },
];

export const LEVELS_BY_KEY = Object.fromEntries(
  LEVELS.map((level) => [level.key, level]),
);

export const LEVEL_LABELS = Object.fromEntries(
  LEVELS.map((level) => [level.key, level.label]),
);

export function levelLabel(level) {
  return LEVEL_LABELS[level] ?? level;
}