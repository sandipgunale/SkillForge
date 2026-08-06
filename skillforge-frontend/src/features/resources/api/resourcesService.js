import { apiClient } from "@/services/api/axios";

class ResourcesService {
  /**
   * Get paginated resources
   */
  async getResources(params = {}) {
    const response = await apiClient.get("/v1/resources", {
      params,
    });

    return {
      resources: response.data.content,
      page: response.data.number,
      size: response.data.size,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      first: response.data.first,
      last: response.data.last,
      empty: response.data.empty,
    };
  }

  /**
   * Get single resource
   */
  async getResource(resourceId) {
    const response = await apiClient.get(`/v1/resources/${resourceId}`);
    return response.data;
  }

  /**
   * Get all topics
   */
  async getTopics() {
    const response = await apiClient.get("/v1/topics");
    return response.data;
  }

  /**
   * Get related resources
   */
  async getRelatedResources(topicId, currentResourceId) {
    const response = await this.getResources({
      topicId,
      size: 5,
    });

    return response.resources
      .filter(resource => resource.id !== currentResourceId)
      .slice(0, 4);
  }

  /**
   * Create resource
   */
  async createResource(payload) {
    const response = await apiClient.post("/v1/resources", payload);
    return response.data;
  }

  /**
   * Update resource
   */
  async updateResource(resourceId, payload) {
    const response = await apiClient.put(
      `/v1/resources/${resourceId}`,
      payload
    );

    return response.data;
  }

  /**
   * Delete resource
   */
  async deleteResource(resourceId) {
    await apiClient.delete(`/v1/resources/${resourceId}`);
  }
}

export const resourcesService = new ResourcesService();