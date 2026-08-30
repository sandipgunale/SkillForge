import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";

import { useCourseCurriculum } from "../../hooks/useCourseCurriculum";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import CourseCurriculumRail from "./CourseCurriculumRail";
import LessonWorkspace from "./LessonWorkspace";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseExperience({ resource }) {
  const courseId = resource.id;
  const { data: curriculum, isLoading } = useCourseCurriculum(courseId);
  const { data: progress } = useCourseProgress(courseId);

  const lessons = useMemo(() => {
    if (!curriculum) return [];
    const items = [];
    (curriculum.sections || []).forEach((section) => items.push(...section.lessons));
    items.push(...(curriculum.uncategorizedLessons || []));
    return items;
  }, [curriculum]);

  const completion = useMemo(() => progress?.lessonCompletion || {}, [progress]);
  const [selectedId, setSelectedId] = useState(null);

  const initialId = useMemo(() => {
    if (!lessons.length) return null;
    const firstIncompleteRequired = lessons.find(
      (lesson) => lesson.required !== false && !completion[lesson.id],
    );
    if (firstIncompleteRequired) return firstIncompleteRequired.id;
    const firstIncomplete = lessons.find((lesson) => !completion[lesson.id]);
    return (firstIncomplete || lessons[0]).id;
  }, [lessons, completion]);

  const activeId = selectedId || initialId;
  const activeLesson = lessons.find((lesson) => lesson.id === activeId) || lessons[0];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        This course has no lessons yet.
      </div>
    );
  }

  const goNext = () => {
    const idx = lessons.findIndex((lesson) => lesson.id === activeId);
    if (idx >= 0 && idx < lessons.length - 1) setSelectedId(lessons[idx + 1].id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ember/10 text-ember">
          <ListChecks className="size-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-muted-foreground">
              {progress?.completedRequiredLessons ?? 0}/
              {progress?.totalRequiredLessons ?? lessons.length} lessons ·{" "}
              {progress?.completionPercentage ?? 0}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember to-aurora transition-all"
              style={{ width: `${progress?.completionPercentage ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CourseCurriculumRail
          curriculum={curriculum}
          completion={completion}
          activeId={activeId}
          onSelect={setSelectedId}
        />
        <div className="lg:col-span-2">
          <LessonWorkspace
            courseId={courseId}
            lesson={activeLesson}
            completed={!!completion[activeId]}
            onNext={goNext}
            isLast={lessons[lessons.length - 1]?.id === activeId}
            topicId={resource.topicId}
            topicName={resource.topicName}
          />
        </div>
      </div>
    </div>
  );
}
