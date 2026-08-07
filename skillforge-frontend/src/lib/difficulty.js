const DIFFICULTIES = {
  BEGINNER: { variant: "default", label: "Beginner" },
  INTERMEDIATE: { variant: "secondary", label: "Intermediate" },
  ADVANCED: { variant: "destructive", label: "Advanced" },
};

export const getDifficultyVariant = (difficulty) =>
  DIFFICULTIES[difficulty?.toUpperCase()]?.variant ?? "outline";

export const getDifficultyLabel = (difficulty) =>
  DIFFICULTIES[difficulty?.toUpperCase()]?.label ?? "Unknown";