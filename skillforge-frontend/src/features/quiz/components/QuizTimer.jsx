import { useEffect } from "react";

import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

import { useQuizStore } from "../store/quizStore";

export default function QuizTimer({ onTimeout }) {
  const remainingTime = useQuizStore((state) => state.remainingTime);

  const tick = useQuizStore((state) => state.tick);

  useEffect(() => {
    if (remainingTime <= 0) {
      onTimeout?.();
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, tick, onTimeout]);

  const minutes = Math.floor(remainingTime / 60);

  const seconds = remainingTime % 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold",

        remainingTime <= 30 && "border-red-500 text-red-500",

        remainingTime > 30 &&
          remainingTime <= 60 &&
          "border-orange-500 text-orange-500",
      )}
    >
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
