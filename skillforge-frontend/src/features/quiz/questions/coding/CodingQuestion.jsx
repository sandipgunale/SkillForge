import { Code2 } from "lucide-react";

import CodeEditor from "../../components/CodeEditor";
import CodingProblem from "../../components/CodingProblem";
import ContentBlocks from "../../components/ContentBlocks";

export default function CodingQuestion({ question, selectedAnswer, onAnswer }) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="space-y-4 lg:col-span-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Code2 className="size-3.5" aria-hidden="true" />
          Problem
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <CodingProblem content={question?.content}>
            <ContentBlocks content={question?.content} />
          </CodingProblem>
        </div>
      </section>

      <section className="space-y-3 lg:col-span-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your Solution
          </span>
        </div>

        <CodeEditor
          value={selectedAnswer ?? ""}
          onChange={onAnswer}
          language="solution"
          minHeight={360}
        />
      </section>
    </div>
  );
}
