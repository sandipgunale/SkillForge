import { apiClient } from "@/services/api/axios";

export const learningPathApi = {
  /**
   * Get all learning paths
   */
  getLearningPaths: async () => {
    const { data } = await apiClient.get("/v1/learning-paths");

    return data;
  },

  /**
   * Get learning path by id
   */
  getLearningPath: async (learningPathId) => {
    const { data } = await apiClient.get(
      `/v1/learning-paths/${learningPathId}`
    );

    return data;
  },

  /**
   * Create new learning path
   */
  createLearningPath: async (payload) => {
    const { data } = await apiClient.post(
      "/v1/learning-paths",
      payload
    );

    return data;
  },

  /**
   * Update learning path
   */
  updateLearningPath: async (
    learningPathId,
    payload
  ) => {
    const { data } = await apiClient.put(
      `/v1/learning-paths/${learningPathId}`,
      payload
    );

    return data;
  },

  /**
   * Update learning path status
   */
  updateStatus: async (
    learningPathId,
    status
  ) => {
    const { data } = await apiClient.patch(
      `/v1/learning-paths/${learningPathId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return data;
  },

    /**
   * Update week completion
   */
  updateWeekCompletion: async (
    learningPathId,
    weekNumber,
    completed
  ) => {
    const { data } = await apiClient.patch(
      `/v1/learning-paths/${learningPathId}/weeks/${weekNumber}`,
      {
        completed,
      }
    );

    return data;
  },

  /**
   * Delete learning path
   */
  deleteLearningPath: async (
    learningPathId
  ) => {
    const { data } = await apiClient.delete(
      `/v1/learning-paths/${learningPathId}`
    );

    return data;
  },

  
};
