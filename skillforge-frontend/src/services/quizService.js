import api from "./api";

export const quizService = {
  generateQuiz: (data) =>
    api.post("/quizzes/generate", data).then((res) => res.data),

  submitAnswers: (quizId, data) =>
    api.post(`/quizzes/${quizId}/submit`, data).then((res) => res.data),

  getQuizHistory: (params) =>
    api.get("/quizzes/history", { params }).then((res) => res.data),

  getQuizResult: (quizId) =>
    api.get(`/quizzes/${quizId}/result`).then((res) => res.data),
};