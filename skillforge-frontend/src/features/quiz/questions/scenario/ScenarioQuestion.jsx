import { Target } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import ContentBlocks from "../../components/ContentBlocks";

export default function ScenarioQuestion({ question, selectedAnswer, onAnswer }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Target className="size-3.5" aria-hidden="true" />
          Situation
        </div>

        <ContentBlocks content={question.content} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="scenario-answer"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Your Decision &amp; Justification
        </label>

        <Textarea
          id="scenario-answer"
          value={selectedAnswer ?? ""}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder="Describe the decision you would make and why."
          rows={8}
          className="min-h-[200px] text-[0.95rem] leading-7"
        />
      </div>
    </div>
  );
}
