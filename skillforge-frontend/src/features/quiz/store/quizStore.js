import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useQuizStore = create(
  persist(
    (set, get) => ({
      /*
       * ==========================
       * State
       * ==========================
       */

      quiz: null,

      currentQuestion: 0,

      answers: {},

      remainingTime: 0,

      submitting: false,

      /*
       * ==========================
       * Quiz
       * ==========================
       */

      setQuiz: (quiz) =>
        set({
          quiz,
          currentQuestion: 0,
          answers: {},
        }),

      resetQuiz: () =>
        set({
          quiz: null,
          currentQuestion: 0,
          answers: {},
          remainingTime: 0,
          submitting: false,
        }),

      /*
       * ==========================
       * Navigation
       * ==========================
       */

      setCurrentQuestion: (index) => {
        const quiz = get().quiz;

        if (!quiz) return;

        const maxIndex = quiz.questions.length - 1;

        set({
          currentQuestion: Math.max(
            0,
            Math.min(index, maxIndex)
          ),
        });
      },

      /*
       * ==========================
       * Answers
       * ==========================
       */

      answerQuestion: (questionId, answer) =>
        set((state) => {
          if (state.answers[questionId] === answer) {
            return state;
          }

          return {
            answers: {
              ...state.answers,
              [questionId]: answer,
            },
          };
        }),

      clearAnswers: () =>
        set({
          answers: {},
        }),

      /*
       * ==========================
       * Timer
       * ==========================
       */

      startTimer: (seconds) =>
        set({
          remainingTime: seconds,
        }),

      tick: () =>
        set((state) => ({
          remainingTime: Math.max(
            0,
            state.remainingTime - 1
          ),
        })),

      setRemainingTime: (seconds) =>
        set({
          remainingTime: Math.max(0, seconds),
        }),

      /*
       * ==========================
       * Submission
       * ==========================
       */

      setSubmitting: (value) =>
        set({
          submitting: value,
        }),
    }),
    {
      name: "skillforge-quiz-store",

      partialize: (state) => ({
        quiz: state.quiz,
        currentQuestion: state.currentQuestion,
        answers: state.answers,
        remainingTime: state.remainingTime,
      }),
    }
  )
);