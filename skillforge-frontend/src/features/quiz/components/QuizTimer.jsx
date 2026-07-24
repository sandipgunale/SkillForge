import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useQuizStore } from "../store/quizStore";

export default function QuizTimer({ onTimeout }) {
  const remainingTime = useQuizStore((state) => state.remainingTime);
  const tick = useQuizStore((state) => state.tick);

  const timeoutTriggered = useRef(false);

  // Stable timer
  useEffect(() => {
    if (remainingTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  // Fire timeout only once
  useEffect(() => {
    if (remainingTime > 0) {
      timeoutTriggered.current = false;
      return;
    }

    if (timeoutTriggered.current) {
      return;
    }

    timeoutTriggered.current = true;

    onTimeout?.();
  }, [remainingTime, onTimeout]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const isCritical = remainingTime <= 30;
  const isWarning = remainingTime > 30 && remainingTime <= 60;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold transition-colors",

        isCritical && "border-red-500 text-red-500",

        isWarning && "border-orange-500 text-orange-500",
      )}
    >
      <Clock className="h-4 w-4" />

      <span className="tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
