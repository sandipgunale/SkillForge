import { UserRound } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

export default function InterviewQuestion({ question, selectedAnswer, onAnswer }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <UserRound className="size-3.5" aria-hidden="true" />
          Interviewer
        </div>

        <p className="text-lg font-medium leading-relaxed text-foreground">
          {question.content}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="interview-answer"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Your Response
        </label>

        <Textarea
          id="interview-answer"
          value={selectedAnswer ?? ""}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder="Explain your reasoning clearly. Treat this like a real interview."
          rows={9}
          className="min-h-[220px] text-[0.95rem] leading-7"
        />
      </div>
    </div>
  );
}
