import { apiClient } from "@/services/api/axios";

export const courseSectionApi = {
  async createSection(resourceId, payload) {
    const { data } = await apiClient.post(
      `/v1/resources/${resourceId}/sections`,
      payload,
    );
    return data;
  },

  async updateSection(sectionId, payload) {
    const { data } = await apiClient.put(`/v1/sections/${sectionId}`, payload);
    return data;
  },

  async deleteSection(sectionId) {
    await apiClient.delete(`/v1/sections/${sectionId}`);
  },

  async reorderSections(resourceId, orderedIds) {
    await apiClient.put(`/v1/resources/${resourceId}/sections/order`, {
      orderedIds,
    });
  },
};
