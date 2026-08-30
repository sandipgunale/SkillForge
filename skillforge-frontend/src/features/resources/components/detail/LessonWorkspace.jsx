import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, ExternalLink, FileText, GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";

import MediaPlayer from "@/components/media/MediaPlayer";
import { Button } from "@/components/ui/button";
import { useMarkLessonComplete } from "../../hooks/useCourseProgress";
import { useLessonQuiz } from "@/features/quiz/hooks/useLessonQuiz";
import { ROUTES } from "@/constants/routes";

export default function LessonWorkspace({ courseId, lesson, completed, onNext, isLast, topicId, topicName }) {
  const navigate = useNavigate();
  const mark = useMarkLessonComplete(courseId);
  const { data: lessonQuiz, isLoading: quizLoading } = useLessonQuiz(lesson?.id);
  if (!lesson) return null;

  const materials = Array.isArray(lesson.materials) ? lesson.materials : [];

  const toggleComplete = (next) => {
    mark.mutate(
      { lessonId: lesson.id, completed: next },
      { onError: () => toast.error("Could not update progress. Are you signed in?") },
    );
  };

  const startLessonQuiz = () => {
    const params = new URLSearchParams({ source: "TOPIC", lessonId: lesson.id });
    if (topicId) params.set("topicId", topicId);
    if (topicName) params.set("topicName", topicName);
    navigate(`${ROUTES.QUIZ_SETUP}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-xl font-semibold">{lesson.title}</h2>
        {lesson.description && (
          <p className="mt-2 text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {lesson.url ? (
        <MediaPlayer
          url={lesson.url}
          type={lesson.type}
          title={lesson.title}
          youtubeVideoId={lesson.youtubeVideoId}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <FileText className="size-10" />
          <p>This lesson has no primary media. Review the materials below.</p>
        </div>
      )}

      {materials.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-ember" /> Related Materials
          </h3>
          <ul className="space-y-2">
            {materials.map((material, index) => (
              <li key={index}>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
                >
                  <span className="min-w-0 truncate font-medium">{material.title}</span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!quizLoading && (
        <div className="rounded-xl border border-aurora/30 bg-aurora/5 p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="size-4 text-aurora" /> Practice quiz
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {lessonQuiz
              ? "You have a quiz for this lesson. Review your understanding before moving on."
              : "Test your understanding of this lesson with a generated quiz."}
          </p>
          {lessonQuiz ? (
            <Button variant="aurora" onClick={() => navigate(ROUTES.QUIZ.replace(":quizId", lessonQuiz.id))}>
              Take quiz
            </Button>
          ) : (
            <Button variant="aurora" onClick={startLessonQuiz}>
              Generate quiz
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Button
          variant={completed ? "outline" : "default"}
          onClick={() => toggleComplete(!completed)}
          disabled={mark.isPending}
        >
          <Check className="mr-2 size-4" />
          {completed ? "Mark incomplete" : "Mark complete"}
        </Button>

        {!isLast && (
          <Button variant="ghost" onClick={onNext}>
            Next lesson <ChevronRight className="ml-1 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
