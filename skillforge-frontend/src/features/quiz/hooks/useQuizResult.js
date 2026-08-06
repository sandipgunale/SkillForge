import { useQuery } from "@tanstack/react-query";

import { quizApi } from "../api/quiz.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useQuizResult(
  quizId,
  enabled = true
) {
  return useQuery({
    queryKey: QUERY_KEYS.QUIZ_RESULT(quizId),

    queryFn: () =>
      quizApi.getQuizResult(quizId),

    enabled:
      enabled && Boolean(quizId),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}