import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  LayoutGrid,
  Lock,
  Play,
  Route,
} from "lucide-react";

import { computeWeekStates } from "@/features/learning-path/utils/weekStates";
import { getDifficultyLabel } from "@/lib/difficulty";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../store/workspaceStore";

/* ==========================================================================
   Knowledge Navigation — the left panel of the Learning Workspace.
   Renders the roadmap as a dependency-aware week tree: completed → current
   → locked. Selecting a topic opens it in the Learning Canvas.
   ========================================================================== */

const STATE_META = {
  completed: { icon: CheckCircle2, className: "text-success" },
  current: { icon: Play, className: "text-info" },
  locked: { icon: Lock, className: "text-muted-foreground/60" },
  pending: { icon: Circle, className: "text-muted-foreground/60" },
};

export default function KnowledgeNav({ learningPath }) {
  const selectedWeek = useWorkspaceStore((s) => s.selectedWeek);
  const selectedTopic = useWorkspaceStore((s) => s.selectedTopic);
  const selectTopic = useWorkspaceStore((s) => s.selectTopic);

  const roadmap = learningPath?.roadmapJson;
  const weeks = useMemo(() => roadmap?.weeks ?? [], [roadmap]);
  const states = useMemo(() => computeWeekStates(weeks), [weeks]);

  const completedWeeks = weeks.filter((week) => week.completed).length;
  const progress = weeks.length ? (completedWeeks / weeks.length) * 100 : 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Path header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-3xs font-semibold uppercase tracking-widest text-muted-foreground">
              Active roadmap
            </p>
            <h2 className="mt-1 truncate text-sm font-semibold">
              {learningPath?.title ?? "Learning Workspace"}
            </h2>
          </div>
          <Link
            to={ROUTES.learningPathDetail(learningPath?.id)}
            aria-label="Open roadmap detail"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Route className="size-4" />
          </Link>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <span>
              {completedWeeks}/{weeks.length} weeks
            </span>
            <span className="font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember to-aurora transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week tree */}
      {weeks.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
          No roadmap yet. Generate one on the Learning Paths page.
        </p>
      ) : (
        <nav aria-label="Roadmap weeks" className="space-y-3">
          {weeks.map((week) => {
            const state = states.get(week.week) ?? "pending";
            const meta = STATE_META[state];
            const isOpen = selectedWeek === week.week;

            return (
              <section key={week.week} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium",
                    isOpen ? "bg-primary/10 text-foreground" : "text-muted-foreground",
                  )}
                >
                  <meta.icon className={cn("size-3.5 shrink-0", meta.className)} />
                  <span className="flex-1 truncate">
                    W{week.week} · {week.title}
                  </span>
                  <span className="shrink-0 text-3xs tabular-nums text-muted-foreground/70">
                    {week.estimatedHours}h
                  </span>
                </div>

                {(week.topics ?? []).map((topic) => {
                  const active =
                    isOpen && selectedTopic === topic.name;
                  return (
                    <button
                      key={topic.name}
                      type="button"
                      onClick={() => selectTopic(week.week, topic.name)}
                      disabled={state === "locked"}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg py-1.5 pl-4 pr-2 text-left text-xs transition-colors",
                        active
                          ? "bg-ember/15 font-semibold text-ember"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        state === "locked" && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full transition-colors",
                          active ? "bg-ember" : "bg-muted-foreground/40 group-hover:bg-ember/60",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{topic.name}</span>
                      <span className="shrink-0 text-4xs uppercase tracking-wide text-muted-foreground/60">
                        {getDifficultyLabel(topic.difficulty)}
                      </span>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </nav>
      )}

      <div className="flex-1" />

      <p className="flex items-center gap-1.5 text-3xs uppercase tracking-widest text-muted-foreground/60">
        <LayoutGrid className="size-3" />
        Knowledge Navigation
      </p>
    </div>
  );
}