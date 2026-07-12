import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export default function QuestionReview({ questions = [] }) {
  return (
    <Card className="border shadow-sm transition-all duration-300 hover:shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div>
          <h3 className="text-xl font-semibold">Question Review</h3>

          <p className="text-sm text-muted-foreground">
            {questions.every((q) => q.correct)
              ? "Review the explanations to reinforce your understanding."
              : "Review each answer and learn from your mistakes."}
          </p>
        </div>

        {/* Empty State */}
        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-muted-foreground">
              No question review available.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.questionId}
              className={cn(
                "rounded-xl border p-5 transition-all duration-300 hover:shadow-md",

                question.correct
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5",
              )}
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {question.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}

                  <h4 className="font-semibold">Question {index + 1}</h4>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",

                    question.correct
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  )}
                >
                  {question.correct ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Question */}
              <div className="mb-5">
                <p className="font-medium leading-7">{question.content}</p>
              </div>

              {/* Answers */}
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 font-semibold">Your Answer</p>

                  <p className="rounded-md bg-background p-3">
                    {question.userAnswer || "Not Answered"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 font-semibold">Correct Answer</p>

                  <p className="rounded-md bg-background p-3">
                    {question.correctAnswer}
                  </p>
                </div>

                <div>
                  <p className="mb-1 font-semibold">AI Feedback</p>

                  <p className="rounded-md bg-background p-3 text-muted-foreground leading-7">
                    {question.aiFeedback}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
