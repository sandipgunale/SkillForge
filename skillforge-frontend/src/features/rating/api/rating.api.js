import { apiClient } from "@/services/api/axios";

export const ratingApi = {
  /**
   * Add or update rating
   */
  async rateResource(resourceId, value) {
    const response = await apiClient.post(
      `/v1/ratings/${resourceId}`,
      {
        value,
      }
    );

    return response.data.data;
  },

  /**
   * Get current user's rating
   */
  async getUserRating(resourceId) {
    const response = await apiClient.get(
      `/v1/ratings/${resourceId}`
    );

    return response.data.data;
  },

  /**
   * Delete rating
   */
  async deleteRating(resourceId) {
    const response = await apiClient.delete(
      `/v1/ratings/${resourceId}`
    );

    return response.data.data;
  },
};