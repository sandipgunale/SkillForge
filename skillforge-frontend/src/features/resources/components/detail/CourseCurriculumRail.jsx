import { Check, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function LessonRow({ lesson, completed, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lesson.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active ? "border-ember/50 bg-ember/5" : "hover:bg-foreground/5",
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
          completed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {completed ? <Check className="size-3.5" /> : <PlayCircle className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{lesson.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {lesson.durationMinutes ? `${lesson.durationMinutes} min` : ""}
          {lesson.freePreview ? " · Preview" : ""}
          {lesson.required === false ? " · Optional" : ""}
        </span>
      </span>
    </button>
  );
}

export default function CourseCurriculumRail({ curriculum, completion, activeId, onSelect }) {
  const sections = curriculum?.sections || [];
  const uncategorized = curriculum?.uncategorizedLessons || [];

  return (
    <aside className="space-y-4 rounded-xl border bg-card p-4">
      <h3 className="px-1 text-sm font-semibold">Curriculum</h3>
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.section.id} className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.section.title}
            </p>
            <div className="space-y-1.5">
              {section.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  completed={!!completion[lesson.id]}
                  active={lesson.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lessons
            </p>
            <div className="space-y-1.5">
              {uncategorized.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  completed={!!completion[lesson.id]}
                  active={lesson.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
