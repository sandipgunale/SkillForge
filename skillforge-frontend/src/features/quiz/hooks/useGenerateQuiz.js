import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { quizApi } from "../api/quiz.api";
import { useQuizStore } from "../store/quizStore";

import { ROUTES } from "@/constants/routes";

export function useGenerateQuiz() {
  const navigate = useNavigate();

  const setQuiz = useQuizStore((state) => state.setQuiz);

  return useMutation({
    mutationFn: quizApi.generateQuiz,

    onSuccess: (quiz) => {
      setQuiz(quiz);

      toast.success("Quiz generated successfully!");

      navigate(
  ROUTES.QUIZ.replace(":quizId", quiz.id)
);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to generate quiz."
      );
    },
  });
}