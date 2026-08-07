import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Circle,
  Pause,
  Play,
  Timer,
  Zap,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../store/workspaceStore";

/* ==========================================================================
   Session Bar — the bottom controls of the Learning Workspace.
   Tracks focused study time for the current session (stored in the
   workspace store) and surfaces the current context + quick actions.
   ========================================================================== */

const FOCUS_TARGET = 25 * 60;

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function SessionBar({ learningPath, week, topic }) {
  const [running, setRunning] = useState(false);
  const addFocusSeconds = useWorkspaceStore((s) => s.addFocusSeconds);
  const focusSeconds = useWorkspaceStore((s) => s.focusSeconds);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(
      () => addFocusSeconds(1),
      1000,
    );
    return () => window.clearInterval(id);
  }, [running, addFocusSeconds]);

  const toggle = () => setRunning((value) => !value);

  const sessionProgress = Math.min(
    100,
    (focusSeconds / FOCUS_TARGET) * 100,
  );

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-t bg-background/70 px-3 backdrop-blur-xl">
      {/* Focus timer */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={running ? "Pause focus session" : "Start focus session"}
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-colors",
            running
              ? "bg-ember text-primary-foreground"
              : "border border-border text-muted-foreground hover:border-ember/50 hover:text-ember",
          )}
        >
          {running ? (
            <Pause className="size-3.5" aria-hidden="true" />
          ) : (
            <Play className="size-3.5" aria-hidden="true" />
          )}
        </button>
        <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums">
          <Timer className="size-3.5 text-ember" aria-hidden="true" />
          {formatTime(focusSeconds)}
        </div>
        {/* Session progress */}
        <div
          className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-muted sm:block"
          role="progressbar"
          aria-label="Focus session progress"
          aria-valuenow={Math.round(sessionProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000",
              running
                ? "bg-gradient-to-r from-ember to-aurora"
                : "bg-ember/50",
            )}
            style={{ width: `${sessionProgress}%` }}
          />
        </div>
      </div>

      <span className="mx-1 h-5 w-px bg-border" />

      {/* Context */}
      <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
        <BookOpen className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate text-muted-foreground">
          {topic
            ? `Focusing on ${topic}`
            : week
              ? `Week ${week.week} · ${week.title}`
              : "No topic selected"}
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1.5 text-2xs">
        <Link
          to={ROUTES.QUIZ_SETUP}
          state={{
            source: "LEARNING_PATH",
            learningPathId: learningPath?.id,
            weekNumber: week?.week ?? 1,
          }}
          className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:border-ember/40 hover:text-ember sm:flex"
        >
          <Zap className="size-3" aria-hidden="true" />
          Quiz
        </Link>
        <Link
          to={learningPath ? ROUTES.learningPathDetail(learningPath.id) : ROUTES.LEARNING_PATH}
          className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:border-ember/40 hover:text-ember md:flex"
        >
          <Circle className="size-3" aria-hidden="true" />
          Roadmap
        </Link>
      </div>
    </div>
  );
}