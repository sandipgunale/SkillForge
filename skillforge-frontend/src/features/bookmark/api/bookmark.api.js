import { apiClient } from "@/services/api/axios";

export const bookmarkApi = {
  /**
   * Add bookmark
   */
  async addBookmark(resourceId) {
    const response = await apiClient.post(
      `/v1/bookmarks/${resourceId}`
    );

    return response.data.data;
  },

  /**
   * Remove bookmark
   */
  async removeBookmark(resourceId) {
    const response = await apiClient.delete(
      `/v1/bookmarks/${resourceId}`
    );

    return response.data.data;
  },

  /**
   * Get all bookmarks
   */
  async getBookmarks() {
    const response = await apiClient.get(
      "/v1/bookmarks"
    );

    return response.data.data;
  },

  /**
   * Check bookmark status
   */
  async getBookmarkStatus(resourceId) {
    const response = await apiClient.get(
      `/v1/bookmarks/status/${resourceId}`
    );

    return response.data.data;
  },
};