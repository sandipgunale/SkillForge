import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export default function QuestionPalette({
  questions,
  currentQuestion,
  answers,
  onSelect,
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Title */}
      <h3 className="mb-4 text-lg font-semibold">Questions</h3>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3">
        {questions.map((question, index) => {
          const answered = answers[question.id] !== undefined;
          const current = currentQuestion === index;

          return (
            <Button
              key={question.id}
              variant="outline"
              size="icon"
              onClick={() => onSelect(index)}
              className={cn(
                "h-11 w-11 rounded-lg transition-all",

                current && "border-primary bg-primary text-primary-foreground",

                !current &&
                  answered &&
                  "border-green-500 bg-green-500 text-white",

                !current && !answered && "border-muted",
              )}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary" />
          <span>Current</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500" />
          <span>Answered</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border" />
          <span>Not Answered</span>
        </div>
      </div>
    </div>
  );
}
