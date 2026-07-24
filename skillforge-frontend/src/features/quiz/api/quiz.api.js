import { apiClient } from "@/services/api/axios";

export const quizApi = {
  /**
   * Generate Quiz
   */
  async generateQuiz(payload) {
    const { data } = await apiClient.post("/v1/quizzes", payload);

    return data.data;
  },

  /**
   * Fetch Quiz
   */
  async getQuiz(quizId) {
    const { data } = await apiClient.get(`/v1/quizzes/${quizId}`);

    return data.data;
  },

  /**
   * Submit Quiz
   */
  async submitQuiz(quizId, payload) {
    const { data } = await apiClient.post(
      `/v1/quizzes/${quizId}/submit`,
      payload
    );

    return data.data;
  },

  /**
   * Fetch Quiz Result
   */
  async getQuizResult(quizId) {
    const { data } = await apiClient.get(
      `/v1/quizzes/${quizId}/result`
    );

    return data.data;
  },

  /**
   * Quiz History
   */
  async getQuizHistory({
    page = 0,
    size = 10,
    source,
    difficulty,
    status,
    sort,
  } = {}) {
    const params = {
      page,
      size,
    };

    if (source) params.source = source;
    if (difficulty) params.difficulty = difficulty;
    if (status) params.status = status;
    if (sort) params.sort = sort;

    const { data } = await apiClient.get(
      "/v1/quizzes/history",
      {
        params,
      }
    );

    return data.data;
  },
};