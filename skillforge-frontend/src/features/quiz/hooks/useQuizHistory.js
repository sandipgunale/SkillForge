import { useQuery } from "@tanstack/react-query";

import { quizApi } from "../api/quiz.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useQuizHistory(
  page = 0,
  size = 10
) {
  return useQuery({
    queryKey: [
   ...QUERY_KEYS.QUIZ_HISTORY,
   page,
   size
],

    queryFn: () =>
      quizApi.getQuizHistory(page, size),

    staleTime: 1000 * 60 * 5,
  });
}