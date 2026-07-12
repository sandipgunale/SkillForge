import { apiClient } from "@/services/api/axios";

export const resourcesApi = {
  async getResources({
    page = 0,
    size = 12,
    topicId,
    difficulty,
    type,
    search,
  } = {}) {
    const { data } = await apiClient.get("/resources", {
      params: {
        page,
        size,
        topicId,
        difficulty,
        type,
        search,
      },
    });

    return {
      resources: data.content,

      page: data.number,

      pageSize: data.size,

      totalPages: data.totalPages,

      totalElements: data.totalElements,

      first: data.first,

      last: data.last,
    };
  },

  async getTopics() {
    const { data } = await apiClient.get("/topics");
    return data;
  },

  async getResourceById(id) {
    const { data } = await apiClient.get(`/resources/${id}`);
    return data;
  },
  async getRelatedResources(topicId, currentResourceId) {
  const data = await this.getResources({
    topicId,
    size: 4,
  });

  return data.resources.filter(
    resource => resource.id !== currentResourceId
  );
},
};