import { Trophy } from "lucide-react";

export default function ResultHero({ percentage }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
      <Trophy className="mx-auto mb-4 h-14 w-14 text-yellow-500" />

      <h1 className="text-3xl font-bold">Quiz Completed!</h1>

      <p
        className={`mt-6 text-6xl font-bold ${
          percentage >= 90
            ? "text-green-500"
            : percentage >= 70
              ? "text-blue-500"
              : percentage >= 50
                ? "text-yellow-500"
                : "text-red-500"
        }`}
      >
        {percentage.toFixed(0)}%
      </p>

      <p className="mt-2 text-muted-foreground">
        {percentage === 100
          ? "🎉 Perfect Score! Outstanding work."
          : percentage >= 80
            ? "Excellent performance!"
            : percentage >= 60
              ? "Good job! Keep practicing."
              : "Keep learning and try again."}
      </p>
    </div>
  );
}
