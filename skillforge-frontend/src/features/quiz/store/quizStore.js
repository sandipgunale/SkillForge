import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useQuizStore = create(
  persist(
    (set, get) => ({
      quiz: null,

      answers: {},

      currentQuestion: 0,

      remainingTime: 0,

      quizEndsAt: null,

      setQuiz: (quiz) =>
        set({
          quiz,
          currentQuestion: 0,
          answers: {},
          remainingTime: 0,
          quizEndsAt: null,
        }),

      answerQuestion: (questionId, answer) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: answer,
          },
        })),

      setCurrentQuestion: (index) =>
        set((state) => {
          const total =
            state.quiz?.questions?.length ?? 0;

          return {
            currentQuestion: Math.max(
              0,
              Math.min(index, total - 1)
            ),
          };
        }),

      startTimer: (seconds) => {
        const endsAt =
          Date.now() + seconds * 1000;

        set({
          quizEndsAt: endsAt,
          remainingTime: seconds,
        });
      },

      tick: () => {
        const { quizEndsAt } = get();

        if (!quizEndsAt) return;

        const remaining = Math.max(
          0,
          Math.floor(
            (quizEndsAt - Date.now()) / 1000
          )
        );

        set({
          remainingTime: remaining,
        });
      },

      resetQuiz: () =>
        set({
          quiz: null,
          answers: {},
          currentQuestion: 0,
          remainingTime: 0,
          quizEndsAt: null,
        }),
    }),
    {
      name: "quiz-storage",

      partialize: (state) => ({
        quiz: state.quiz,
        answers: state.answers,
        currentQuestion:
          state.currentQuestion,
        remainingTime:
          state.remainingTime,
        quizEndsAt: state.quizEndsAt,
      }),
    }
  )
);