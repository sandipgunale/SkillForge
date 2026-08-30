import { Code2, ListChecks, MessageSquareText, Target } from "lucide-react";

import { cn } from "@/lib/utils";

const TYPE_META = {
  MCQ: { label: "MCQ", Icon: ListChecks },
  CODING: { label: "Coding", Icon: Code2 },
  INTERVIEW: { label: "Interview", Icon: MessageSquareText },
  SCENARIO: { label: "Scenario", Icon: Target },
};

function humanize(value) {
  if (!value) return "";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
}

/**
 * Compact metadata header shared by every question type. Shows the
 * question position, the type (as an accent badge) and the real
 * quiz-level context (difficulty / topic) — never invented per-question
 * data that the backend does not provide.
 */
export default function QuestionHeader({ index, total, type, difficulty, topic }) {
  const meta = TYPE_META[type] ?? { label: type, Icon: ListChecks };
  const Icon = meta.Icon;

  const context = [humanize(difficulty), topic].filter(Boolean).join(" · ");

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Question {String(index + 1).padStart(2, "0")}
          <span className="px-1.5 text-border">/</span>
          {String(total).padStart(2, "0")}
        </p>

        {context && (
          <p className="mt-1.5 text-sm text-muted-foreground">{context}</p>
        )}
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5",
          "text-xs font-semibold uppercase tracking-[0.14em] text-primary",
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {meta.label}
      </span>
    </div>
  );
}
