import { apiClient } from "@/services/api/axios";

export const ratingApi = {
  /**
   * Add or update rating
   */
  async rateResource(resourceId, value) {
    const { data } = await apiClient.post(
      `/v1/ratings/${resourceId}`,
      {
        value,
      }
    );

    return data;
  },

  /**
   * Get current user's rating
   */
  async getUserRating(resourceId) {
    const { data } = await apiClient.get(
      `/v1/ratings/${resourceId}`
    );

    return data;
  },

  /**
   * Delete rating
   */
  async deleteRating(resourceId) {
    const { data } = await apiClient.delete(
      `/v1/ratings/${resourceId}`
    );

    return data;
  },
};
