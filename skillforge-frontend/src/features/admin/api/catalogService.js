import { apiClient } from "@/services/api/axios";

class CatalogService {
  async getTags() {
    const response = await apiClient.get("/v1/tags");
    return response.data;
  }

  async createTopic(payload) {
    const response = await apiClient.post("/v1/topics", payload);
    return response.data;
  }

  async updateTopic(topicId, payload) {
    const response = await apiClient.put(`/v1/topics/${topicId}`, payload);
    return response.data;
  }

  async deleteTopic(topicId) {
    await apiClient.delete(`/v1/topics/${topicId}`);
  }

  async createTag(payload) {
    const response = await apiClient.post("/v1/tags", payload);
    return response.data;
  }

  async updateTag(tagId, payload) {
    const response = await apiClient.put(`/v1/tags/${tagId}`, payload);
    return response.data;
  }

  async deleteTag(tagId) {
    await apiClient.delete(`/v1/tags/${tagId}`);
  }
}

export const catalogService = new CatalogService();
