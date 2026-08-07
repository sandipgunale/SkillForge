import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookMarked,
  CheckCircle2,
  ClipboardList,
  Highlighter,
  Layers,
  Sparkles,
  Target,
  Book,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDifficultyLabel } from "@/lib/difficulty";
import { useUpdateWeekCompletion } from "@/features/learning-path/hooks/useUpdateWeekCompletion";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../store/workspaceStore";
import { RESOURCE_ICONS } from "@/lib/resourceIcons";

/* ==========================================================================
   Learning Canvas — the center panel.
   Renders the selected topic: week context, learning goals, attached
   resources, a persisted notes surface and the highlight toggle. Practice
   dispatches to the real quiz generation flow with preselection.
   ========================================================================== */

export default function LearningCanvas({ learningPath }) {
  const navigate = useNavigate();
  const selectedWeek = useWorkspaceStore((s) => s.selectedWeek);
  const selectedTopic = useWorkspaceStore((s) => s.selectedTopic);
  const notes = useWorkspaceStore((s) => s.notes);
  const highlights = useWorkspaceStore((s) => s.highlights);
  const setNote = useWorkspaceStore((s) => s.setNote);
  const toggleHighlight = useWorkspaceStore((s) => s.toggleHighlight);

  const updateWeek = useUpdateWeekCompletion();

  const weeks = useMemo(
    () => learningPath?.roadmapJson?.weeks ?? [],
    [learningPath],
  );

  const week = useMemo(
    () => weeks.find((w) => w.week === selectedWeek) ?? null,
    [weeks, selectedWeek],
  );

  const topic = useMemo(
    () => (week?.topics ?? []).find((t) => t.name === selectedTopic) ?? null,
    [week, selectedTopic],
  );

  const noteKey = useMemo(() => {
    if (!learningPath?.id || week == null || !selectedTopic) return null;
    return `${learningPath.id}:w${week.week}:${selectedTopic}`;
  }, [learningPath, week, selectedTopic]);

  const note = noteKey ? notes[noteKey] ?? "" : "";
  const highlighted = noteKey ? Boolean(highlights[noteKey]) : false;

  const practice = () => {
    navigate(ROUTES.QUIZ_SETUP, {
      state: {
        source: "LEARNING_PATH",
        learningPathId: learningPath?.id,
        weekNumber: week?.week ?? 1,
      },
    });
  };

  if (!topic || !week) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-ember/10 text-ember">
          <Sparkles className="size-7" aria-hidden="true" />
        </div>
        <div className="max-w-sm space-y-2">
          <h2 className="text-lg font-semibold">Pick a topic to begin</h2>
          <p className="text-sm text-muted-foreground">
            Choose any topic in the Knowledge Navigation. Your canvas loads its
            goals, resources and notes here — and the AI Copilot grounds every
            answer in this week's roadmap.
          </p>
        </div>
      </div>
    );
  }

  const goals = week.learningGoals ?? [];
  const resources = week.resources ?? [];
  const currentIndex = (week.topics ?? []).findIndex(
    (t) => t.name === selectedTopic,
  );

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="truncate">{learningPath?.title}</span>
        <span aria-hidden="true">/</span>
        <span className="truncate">Week {week.week}</span>
        <span aria-hidden="true">/</span>
        <span className="truncate font-semibold text-foreground">{topic.name}</span>
      </nav>

      {/* Topic header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
          <Badge variant="secondary" className="capitalize">
            {getDifficultyLabel(topic.difficulty)}
          </Badge>
          <button
            type="button"
            onClick={() => noteKey && toggleHighlight(noteKey)}
            aria-pressed={highlighted}
            aria-label="Toggle highlight for this topic"
            className={cn(
              "ml-auto rounded-lg border p-2 transition-colors",
              highlighted
                ? "border-ember/50 bg-ember/10 text-ember"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Highlighter className="size-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Topic {currentIndex + 1} of {week.topics.length} · {week.estimatedHours} hrs this week
        </p>
      </header>

      {/* Learning goals */}
      <section aria-label="Learning goals" className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Target className="size-4 text-ember" aria-hidden="true" />
          Learning goals
        </h2>
        <ul className="space-y-1.5">
          {goals.length === 0 && (
            <li className="text-sm text-muted-foreground">No goals recorded for this week.</li>
          )}
          {goals.map((goal) => (
            <li key={goal} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Resources */}
      <section aria-label="Resources" className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <BookMarked className="size-4 text-ember" aria-hidden="true" />
          Resources
        </h2>
        <ul className="space-y-1.5">
          {resources.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No resources attached yet — the copilot can recommend some.
            </li>
          )}
          {resources.map((resource, index) => {
            const Icon = RESOURCE_ICONS[resource.type] ?? Book;
            return (
              <li key={`${resource.title}-${index}`} className="flex items-center gap-2.5 rounded-lg border bg-background/50 px-3 py-2 text-sm">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{resource.title}</span>
                <span className="text-3xs uppercase tracking-wide text-muted-foreground/70">
                  {resource.type}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Notes */}
      <section aria-label="Notes" className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4 text-ember" aria-hidden="true" />
            Notes
          </h2>
          <span className="text-3xs uppercase tracking-widest text-muted-foreground/60">
            Auto-saved locally
          </span>
        </div>
        <textarea
          value={note}
          onChange={(event) => noteKey && setNote(noteKey, event.target.value)}
          placeholder="Capture what you learned here — it syncs with this topic across sessions."
          aria-label="Notes for this topic"
          className="min-h-40 flex-1 resize-none rounded-xl border bg-background/50 p-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-ember/50"
        />
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={practice}>
          <ClipboardList className="mr-2 size-4" aria-hidden="true" />
          Practice this topic
        </Button>

        <Button
          variant="outline"
          disabled={week.completed || updateWeek.isPending}
          onClick={() =>
            updateWeek.mutate({
              learningPathId: learningPath.id,
              weekNumber: week.week,
              completed: true,
            })
          }
        >
          <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
          {week.completed ? "Week completed" : "Mark week complete"}
        </Button>
      </div>
    </div>
  );
}