import { apiClient } from "@/services/api/axios";

export const resourcesService = {
  /**
   * Get paginated resources
   */
  async getResources(filters = {}) {
    const {
      page = 0,
      size = 12,
      topicId,
      difficulty,
      type,
      search,
    } = filters;

    // Remove empty query parameters
    const params = Object.fromEntries(
      Object.entries({
        page,
        size,
        topicId,
        difficulty,
        type,
        search,
      }).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );

    const { data } = await apiClient.get("/resources", {
      params,
    });

    return {
      resources: data.content ?? [],
      page: data.number ?? 0,
      pageSize: data.size ?? size,
      totalPages: data.totalPages ?? 0,
      totalElements: data.totalElements ?? 0,
      first: data.first ?? true,
      last: data.last ?? true,
    };
  },

  /**
   * Get all topics
   */
  async getTopics() {
    const { data } = await apiClient.get("/topics");
    return data ?? [];
  },

  /**
   * Get resource details
   */
  async getResourceById(id) {
    if (!id) {
      throw new Error("Resource id is required.");
    }

    const { data } = await apiClient.get(`/resources/${id}`);

    return data;
  },

  /**
   * Get related resources
   */
  async getRelatedResources(topicId, currentResourceId) {
    if (!topicId) return [];

    const response = await this.getResources({
      topicId,
      size: 4,
    });

    return (response.resources ?? []).filter(
      (resource) => resource.id !== currentResourceId
    );
  },
};