import { apiClient } from "@/services/api/axios";

export const contentItemApi = {
  /**
   * List content sections for a resource.
   */
  async getContentItems(resourceId, includeInactive = false) {
    const { data } = await apiClient.get(
      `/v1/resources/${resourceId}/content`,
      { params: { includeInactive } },
    );

    return data;
  },

  /**
   * Add a content section to a resource.
   */
  async createContentItem(resourceId, payload) {
    const { data } = await apiClient.post(
      `/v1/resources/${resourceId}/content`,
      payload,
    );

    return data;
  },

  /**
   * Update a content section.
   */
  async updateContentItem(contentItemId, payload) {
    const { data } = await apiClient.put(
      `/v1/content/${contentItemId}`,
      payload,
    );

    return data;
  },

  /**
   * Soft-delete a content section.
   */
  async deleteContentItem(contentItemId) {
    await apiClient.delete(`/v1/content/${contentItemId}`);
  },

  /**
   * Persist the ordering of content sections.
   */
  async reorderContentItems(resourceId, orderedIds) {
    await apiClient.put(`/v1/resources/${resourceId}/content/order`, {
      orderedIds,
    });
  },
};
