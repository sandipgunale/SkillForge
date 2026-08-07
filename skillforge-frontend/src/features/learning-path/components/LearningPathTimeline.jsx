import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import WeekCard from "./WeekCard";
import { computeWeekStates } from "../utils/weekStates";

export default function LearningPathTimeline({
  roadmap,
  learningPathId,
  weekQuizzes = {},
  focusWeek = null,
}) {
  const weeks = roadmap?.weeks ?? [];

  const states = computeWeekStates(weeks);

  const defaultOpen = weeks.find(
    (week) => states.get(week.week) === "current",
  );

  const [openValue, setOpenValue] = useState(
    defaultOpen ? `week-${defaultOpen.week}` : null,
  );

  useEffect(() => {
    if (focusWeek == null) return;

    const timer = setTimeout(() => {
      setOpenValue(`week-${focusWeek}`);

      document
        .getElementById(`week-${focusWeek}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => clearTimeout(timer);
  }, [focusWeek]);

  if (weeks.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        No weeks available yet.
      </Card>
    );
  }

  return (
    <Accordion
      value={openValue}
      onValueChange={setOpenValue}
      className="space-y-4"
    >
      {weeks.map((week) => {
        const state = states.get(week.week) ?? "pending";

        return (
          <AccordionItem
            key={week.week}
            value={`week-${week.week}`}
            id={`week-${week.week}`}
            className={`rounded-xl border bg-card transition-colors ${
              state === "current" ? "border-blue-500/60 shadow-sm" : ""
            } ${
              state === "completed"
                ? "border-emerald-500/40"
                : ""
            } ${state === "locked" ? "opacity-70" : ""}`}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    state === "completed"
                      ? "bg-success/15 text-success"
                      : state === "current"
                        ? "bg-info/15 text-info"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {week.week}
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {week.title}
                  </span>

                  <span className="block text-xs font-normal text-muted-foreground">
                    {week.estimatedHours} hrs ·{" "}
                    {(week.topics ?? []).length} topics ·{" "}
                    {(week.resources ?? []).length} resources
                  </span>
                </span>

                {state === "completed" && (
                  <span className="hidden text-xs font-medium uppercase tracking-wide text-success sm:inline">
                    Completed
                  </span>
                )}

                {state === "current" && (
                  <span className="hidden text-xs font-medium uppercase tracking-wide text-info sm:inline">
                    Current
                  </span>
                )}

                {state === "locked" && (
                  <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                    Locked
                  </span>
                )}
              </span>
            </AccordionTrigger>

            <AccordionContent>
              <div className="px-4 pb-4 pt-2">
                <WeekCard
                  learningPathId={learningPathId}
                  week={week}
                  locked={state === "locked"}
                  current={state === "current"}
                  quiz={weekQuizzes[week.week]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
