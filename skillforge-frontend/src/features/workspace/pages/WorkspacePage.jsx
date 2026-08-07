import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLearningPaths } from "@/features/learning-path/hooks/useLearningPaths";
import { useLearningPath } from "@/features/learning-path/hooks/useLearningPath";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceLayout } from "../hooks/useWorkspaceLayout";
import { useWorkspaceStore } from "../store/workspaceStore";
import KnowledgeNav from "../components/KnowledgeNav";
import LearningCanvas from "../components/LearningCanvas";
import AICopilot from "../components/AICopilot";
import SessionBar from "../components/SessionBar";
import Splitter from "../components/Splitter";

export default function WorkspacePage() {
  const { learningPathId: learningId } = useParams();
  const containerRef = useRef(null);

  const { sizes, setNav, setCopilot, persist } = useWorkspaceLayout();

  const storePathId = useWorkspaceStore((s) => s.learningPathId);
  const openPath = useWorkspaceStore((s) => s.openPath);
  const selectedWeek = useWorkspaceStore((s) => s.selectedWeek);
  const selectedTopic = useWorkspaceStore((s) => s.selectedTopic);

  const { data: paths, isLoading: pathsLoading } = useLearningPaths();

  const activePathId = learningId ?? storePathId ?? paths?.[0]?.id;

  const { data: learningPath, isLoading: pathLoading } =
    useLearningPath(activePathId);

  useEffect(() => {
    if (activePathId && activePathId !== storePathId) {
      openPath(activePathId);
    }
  }, [activePathId, storePathId, openPath]);

  const weeks = learningPath?.roadmapJson?.weeks ?? [];
  const week = weeks.find((w) => w.week === selectedWeek) ?? null;

  const resize = (column) => (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (column === "nav") setNav(clientX - rect.left);
    else setCopilot(rect.right - clientX);
  };

  /* ------------------------------ Empty state ------------------------------ */
  if (!pathsLoading && paths?.length === 0) {
    return (
      <div className="flex h-[32rem] flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-ember/10 text-ember">
          <Route className="size-7" aria-hidden="true" />
        </div>
        <div className="max-w-sm space-y-2">
          <h2 className="text-lg font-semibold">The Workspace needs a roadmap</h2>
          <p className="text-sm text-muted-foreground">
            Create a learning path first — then the knowledge navigation, the
            learning canvas and the AI copilot all ground themselves in it.
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.LEARNING_PATH}>Create a learning path</Link>
        </Button>
      </div>
    );
  }

  if (pathsLoading || pathLoading) {
    return (
      <div
        className="flex h-[calc(100dvh-5.75rem)] gap-px overflow-hidden rounded-2xl border border-border/60"
        aria-busy="true"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={i === 1 ? "min-w-0 flex-1" : "w-64"}
            aria-hidden="true"
          >
            <div className="h-full animate-pulse bg-muted/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-5.75rem)] min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background">
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Knowledge Navigation */}
        <aside
          className="shrink-0 overflow-hidden"
          style={{ width: sizes.nav }}
          aria-label="Knowledge navigation"
        >
          <KnowledgeNav learningPath={learningPath} />
        </aside>

        <Splitter
          onResize={resize("nav")}
          onDragEnd={persist}
          label="Resize knowledge navigation"
        />

        {/* Center: Learning Canvas */}
        <section
          className="min-w-0 flex-1 overflow-hidden"
          aria-label="Learning canvas"
        >
          <LearningCanvas learningPath={learningPath} />
        </section>

        <Splitter
          onResize={resize("copilot")}
          onDragEnd={persist}
          label="Resize AI copilot"
        />

        {/* Right: AI Copilot */}
        <aside
          className="shrink-0 overflow-hidden"
          style={{ width: sizes.copilot }}
          aria-label="AI copilot"
        >
          <AICopilot learningPath={learningPath} />
        </aside>
      </div>

      <SessionBar
        learningPath={learningPath}
        week={week}
        topic={selectedTopic}
      />
    </div>
  );
}