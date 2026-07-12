import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { quizApi } from "../api/quiz.api";
import { ROUTES } from "@/constants/routes";

import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useSubmitQuiz() {
  const navigate = useNavigate();
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, answers }) =>
      quizApi.submitQuiz(quizId, {
        answers,
      }),

      

    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.DASHBOARD,
        }),

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ANALYTICS,
        }),

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.QUIZ_HISTORY,
        }),
      ]);

      toast.success("Quiz submitted successfully!");

    navigate(
  ROUTES.QUIZ_RESULT.replace(":quizId", result.quizId),
  {
    state: result,
  }
);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to submit quiz."
      );
    },
  });
}