import { useQuery } from "@tanstack/react-query";

import { quizApi } from "../api/quiz.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useQuizHistory({
  page = 0,
  size = 10,
  source,
  difficulty,
  status,
  sort,
} = {}) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.QUIZ_HISTORY,
      {
        page,
        size,
        source,
        difficulty,
        status,
        sort,
      },
    ],

    queryFn: () =>
      quizApi.getQuizHistory({
        page,
        size,
        source,
        difficulty,
        status,
        sort,
      }),

    staleTime: 1000 * 60 * 5,

    keepPreviousData: true,
  });
}