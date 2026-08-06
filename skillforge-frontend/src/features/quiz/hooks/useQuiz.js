import { useQuery } from "@tanstack/react-query";

import { quizApi } from "../api/quiz.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useQuiz(quizId, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.QUIZ(quizId),

    queryFn: () => quizApi.getQuiz(quizId),

    enabled: enabled && !!quizId,

    staleTime: 1000 * 60 * 5,
  });
}