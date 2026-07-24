import { apiClient } from "@/services/api/axios";

export const learningPathApi = {
  /**
   * Get all learning paths
   */
  getLearningPaths: async () => {
    const response = await apiClient.get("/learning-paths");

    return response.data.data;
  },

  /**
   * Get learning path by id
   */
  getLearningPath: async (learningPathId) => {
    const response = await apiClient.get(
      `/learning-paths/${learningPathId}`
    );

    return response.data.data;
  },

  /**
   * Create new learning path
   */
  createLearningPath: async (payload) => {
    const response = await apiClient.post(
      "/learning-paths",
      payload
    );

    return response.data.data;
  },

  /**
   * Update learning path
   */
  updateLearningPath: async (
    learningPathId,
    payload
  ) => {
    const response = await apiClient.put(
      `/learning-paths/${learningPathId}`,
      payload
    );

    return response.data.data;
  },

  /**
   * Update learning path status
   */
  updateStatus: async (
    learningPathId,
    status
  ) => {
    const response = await apiClient.patch(
      `/learning-paths/${learningPathId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return response.data.data;
  },

    /**
   * Update week completion
   */
  updateWeekCompletion: async (
    learningPathId,
    weekNumber,
    completed
  ) => {
    const response = await apiClient.patch(
      `/learning-paths/${learningPathId}/weeks/${weekNumber}`,
      {
        completed,
      }
    );

    return response.data.data;
  },

  /**
   * Delete learning path
   */
  deleteLearningPath: async (
    learningPathId
  ) => {
    const response = await apiClient.delete(
      `/learning-paths/${learningPathId}`
    );

    return response.data.data;
  },

  
};