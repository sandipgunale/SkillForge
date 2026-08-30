import { useQuery } from "@tanstack/react-query";

import { quizApi } from "../api/quiz.api";

export function useLessonQuiz(lessonId) {
  return useQuery({
    queryKey: ["lesson-quiz", lessonId],
    queryFn: () => quizApi.getQuizByLesson(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 30_000,
    select: (response) => response?.data ?? null,
  });
}
