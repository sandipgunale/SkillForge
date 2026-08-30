import { memo, useRef } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMicroInteractions } from "@/lib/motion-gsap";

function PaletteButton({ index, answered, current, onSelect }) {
  const ref = useRef(null);

  useMicroInteractions(ref, { hover: { scale: 1.08 }, tap: { scale: 0.92 } });

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Go to question ${index + 1}${answered ? ", answered" : ", unanswered"}`}
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
    </button>
  );
}

function QuestionPalette({
  questions,
  currentQuestion,
  answers,
  onSelect,
}) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-base font-semibold">Questions</h3>
          <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {String(currentQuestion + 1).padStart(2, "0")}
            <span className="px-1.5 text-border">/</span>
            {String(questions.length).padStart(2, "0")}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div className="mt-5 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {questions.map((question, index) => {
          const answered = answers[question.id] !== undefined;
          const current = currentQuestion === index;

          return (
            <PaletteButton
              key={question.id}
              index={index}
              answered={answered}
              current={current}
              onSelect={onSelect}
            />
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

export default memo(QuestionPalette);