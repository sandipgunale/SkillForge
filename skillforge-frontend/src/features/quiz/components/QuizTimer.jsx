import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useQuizStore } from "../store/quizStore";

export default function QuizTimer({ onTimeout }) {
  const remainingTime = useQuizStore((state) => state.remainingTime);
  const quizEndsAt = useQuizStore((state) => state.quizEndsAt);
  const tick = useQuizStore((state) => state.tick);

  const timeoutTriggered = useRef(false);

  // Stable timer: drive the interval off the absolute deadline, not
  // remainingTime, so a late-mounted timer (timer started in an effect
  // after the first render) still ticks from the very first second.
  useEffect(() => {
    if (quizEndsAt === null) {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [quizEndsAt, tick]);

  // Fire timeout only once per deadline when it has actually expired
  // (a paused/refreshed quiz resumes from the persisted deadline instead
  // of restarting the full duration).
  useEffect(() => {
    if (quizEndsAt !== null && remainingTime <= 0) {
      if (timeoutTriggered.current) {
        return;
      }

      timeoutTriggered.current = true;

      onTimeout?.();
    }
  }, [remainingTime, quizEndsAt, onTimeout]);

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
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tabular-nums transition-colors duration-300",

        isCritical && "animate-pulse border-destructive text-destructive",

        isWarning && "border-warning text-warning",

        !isCritical && !isWarning && "border-border bg-card text-foreground",
      )}
    >
      <Clock className="h-4 w-4" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}