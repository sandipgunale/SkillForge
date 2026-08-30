import { apiClient } from "@/services/api/axios";

export const quizApi = {
  /**
   * Generate Quiz
   */
  async generateQuiz(payload) {
    const { data } = await apiClient.post("/v1/quizzes", payload);

    return data;
  },

  /**
   * Fetch Quiz
   */
  async getQuiz(quizId) {
    const { data } = await apiClient.get(`/v1/quizzes/${quizId}`);

    return data;
  },

  /**
   * Save partial answers (resume support)
   */
  async saveAnswers(quizId, payload) {
    const { data } = await apiClient.put(
      `/v1/quizzes/${quizId}/answers`,
      payload
    );

    return data;
  },

  /**
   * Submit Quiz
   */
  async submitQuiz(quizId, payload) {
    const { data } = await apiClient.post(
      `/v1/quizzes/${quizId}/submit`,
      payload
    );

    return data;
  },

  /**
   * Fetch Quiz Result
   */
  async getQuizResult(quizId) {
    const { data } = await apiClient.get(
      `/v1/quizzes/${quizId}/result`
    );

    return data;
  },

  /**
   * Latest quiz the current user generated for a course lesson (or null).
   */
  async getQuizByLesson(lessonId) {
    const { data } = await apiClient.get("/v1/quizzes/by-lesson", {
      params: { lessonId },
    });

    return data;
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

    return data;
  },
};