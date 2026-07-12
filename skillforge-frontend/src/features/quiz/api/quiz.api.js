import { apiClient } from "@/services/api/axios";

export const quizApi = {
  /**
   * Generate a new quiz
   */
  async generateQuiz(payload) {
    const { data } = await apiClient.post("/v1/quizzes", payload);

    return data.data;
  },

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId, payload) {
    const { data } = await apiClient.post(
      `/v1/quizzes/${quizId}/submit`,
      payload
    );

    return data.data;
  },

  /**
   * Fetch quiz history
   */
  async getQuizHistory(page = 0, size = 10) {
    const { data } = await apiClient.get("/v1/quizzes/history", {
      params: {
        page,
        size,
      },
    });

    return {
      history: data.data.content,
      page: data.data.number,
      totalPages: data.data.totalPages,
      totalElements: data.data.totalElements,
    };
  },
};