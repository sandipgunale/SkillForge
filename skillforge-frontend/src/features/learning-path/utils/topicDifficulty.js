export const getDifficultyVariant = (difficulty) => {
  switch (difficulty?.toUpperCase()) {
    case "BEGINNER":
      return "default";

    case "INTERMEDIATE":
      return "secondary";

    case "ADVANCED":
      return "destructive";

    default:
      return "outline";
  }
};

export const getDifficultyLabel = (difficulty) => {
  switch (difficulty?.toUpperCase()) {
    case "BEGINNER":
      return "🟢 Beginner";

    case "INTERMEDIATE":
      return "🟡 Intermediate";

    case "ADVANCED":
      return "🔴 Advanced";

    default:
      return "Unknown";
  }
};