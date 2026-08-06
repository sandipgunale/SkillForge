import { apiClient } from "@/services/api/axios";

export const bookmarkApi = {
  /**
   * Add bookmark (optionally into a folder)
   */
  async addBookmark(resourceId, folderId) {
    const { data } = await apiClient.post(
      `/v1/bookmarks/${resourceId}`,
      null,
      { params: folderId ? { folderId } : {} }
    );

    return data;
  },

  /**
   * Remove bookmark
   */
  async removeBookmark(resourceId) {
    const { data } = await apiClient.delete(
      `/v1/bookmarks/${resourceId}`
    );

    return data;
  },

  /**
   * Get bookmarks (paginated, optionally filtered by folder)
   */
  async getBookmarks({ folderId, page = 0, size = 12 } = {}) {
    const { data } = await apiClient.get("/v1/bookmarks", {
      params: {
        ...(folderId ? { folderId } : {}),
        page,
        size,
      },
    });

    return data;
  },

  /**
   * Move a bookmark into a folder (null = uncategorized)
   */
  async moveBookmark(resourceId, folderId) {
    const { data } = await apiClient.patch(
      `/v1/bookmarks/${resourceId}/folder`,
      null,
      { params: folderId ? { folderId } : {} }
    );

    return data;
  },

  /**
   * Check bookmark status
   */
  async getBookmarkStatus(resourceId) {
    const { data } = await apiClient.get(
      `/v1/bookmarks/status/${resourceId}`
    );

    return data;
  },

  // ---------- Folders ----------

  async getFolders() {
    const { data } = await apiClient.get("/v1/bookmarks/folders");

    return data;
  },

  async createFolder(name) {
    const { data } = await apiClient.post("/v1/bookmarks/folders", { name });

    return data;
  },

  async renameFolder(folderId, name) {
    const { data } = await apiClient.put(
      `/v1/bookmarks/folders/${folderId}`,
      { name }
    );

    return data;
  },

  async deleteFolder(folderId) {
    const { data } = await apiClient.delete(
      `/v1/bookmarks/folders/${folderId}`
    );

    return data;
  },
};
