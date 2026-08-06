import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { SPRING_SOFT } from "@/lib/motion";

export default function QuestionPalette({
  questions,
  currentQuestion,
  answers,
  onSelect,
}) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Questions</h3>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
          {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2.5">
        {questions.map((question, index) => {
          const answered = answers[question.id] !== undefined;
          const current = currentQuestion === index;

          return (
            <motion.button
              key={question.id}
              type="button"
              onClick={() => onSelect(index)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING_SOFT}
              aria-label={`Go to question ${index + 1}${
                answered ? ", answered" : ", unanswered"
              }`}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                current && "border-primary bg-primary text-primary-foreground",
                !current &&
                  answered &&
                  "border-success/60 bg-success/10 text-success",
                !current && !answered && "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {index + 1}
              {!current && answered && (
                <CheckCircle2
                  className="absolute -right-1 -top-1 size-3.5 rounded-full bg-card text-success"
                  aria-hidden="true"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 border-t pt-5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-3 rounded-[0.4rem] bg-primary" />
          Current question
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex size-3 items-center justify-center">
            <Circle className="size-3 fill-success text-success" />
          </span>
          Answered ({answeredCount})
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-3 rounded-[0.4rem] border border-border" />
          Not answered
        </div>
      </div>
    </div>
  );
}