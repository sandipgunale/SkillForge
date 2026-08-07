import { apiClient } from "@/services/api/axios";

export const resourceApi = {
  /**
   * Get paginated resources
   */
  async getResources(params = {}) {
    const { data } = await apiClient.get("/v1/resources", { params });

    return {
      resources: data.content,
      page: data.number,
      size: data.size,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      first: data.first,
      last: data.last,
      empty: data.empty,
    };
  },

  /**
   * Get single resource
   */
  async getResource(resourceId) {
    const { data } = await apiClient.get(`/v1/resources/${resourceId}`);
    return data;
  },

  /**
   * Get all topics
   */
  async getTopics() {
    const { data } = await apiClient.get("/v1/topics");
    return data;
  },

  /**
   * Get related resources
   */
  async getRelatedResources(topicId, currentResourceId) {
    const { resources } = await this.getResources({
      topicId,
      size: 5,
    });

    return resources
      .filter(resource => resource.id !== currentResourceId)
      .slice(0, 4);
  },

  /**
   * Create resource
   */
  async createResource(payload) {
    const { data } = await apiClient.post("/v1/resources", payload);
    return data;
  },

  /**
   * Update resource
   */
  async updateResource(resourceId, payload) {
    const { data } = await apiClient.put(
      `/v1/resources/${resourceId}`,
      payload,
    );

    return data;
  },

  /**
   * Delete resource
   */
  async deleteResource(resourceId) {
    await apiClient.delete(`/v1/resources/${resourceId}`);
  },
};