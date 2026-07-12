import { create } from "zustand";

export const useQuizStore = create((set) => ({
  // Quiz Data
  quiz: null,

  // Current Question Index
  currentQuestion: 0,

  // Selected Answers
  answers: {},

  // Timer
  remainingTime: 0,

  // Loading State
  submitting: false,

  // -----------------------------
  // Actions
  // -----------------------------

  setQuiz: (quiz) =>
    set({
      quiz,
      currentQuestion: 0,
      answers: {},
    }),

  setCurrentQuestion: (index) =>
    set({
      currentQuestion: index,
    }),

  answerQuestion: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    })),

startTimer: (seconds) =>
  set({
    remainingTime: seconds,
  }),

tick: () =>
  set((state) => ({
    remainingTime: Math.max(0, state.remainingTime - 1),
  })),

  setRemainingTime: (time) =>
    set({
      remainingTime: time,
    }),

  setSubmitting: (value) =>
    set({
      submitting: value,
    }),

  resetQuiz: () =>
    set({
      quiz: null,
      currentQuestion: 0,
      answers: {},
      remainingTime: 0,
      submitting: false,
    }),
}));