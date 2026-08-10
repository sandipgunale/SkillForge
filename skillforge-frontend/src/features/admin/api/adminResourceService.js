import { apiClient } from "@/services/api/axios";

class AdminResourceService {
  async getResources(params = {}) {
    const { data } = await apiClient.get("/admin/resources", { params });

    return {
      resources: data.content ?? data.data,
      page: data.number ?? data.page,
      size: data.size,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      first: data.first,
      last: data.last,
      empty: data.empty,
    };
  }

  async getResource(resourceId) {
    const { data } = await apiClient.get(`/admin/resources/${resourceId}`);
    return data;
  }

  async createResource(payload) {
    const { data } = await apiClient.post("/v1/resources", payload);
    return data;
  }

  async updateResource(resourceId, payload) {
    const { data } = await apiClient.put(
      `/v1/resources/${resourceId}`,
      payload,
    );
    return data;
  }

  async deleteResource(resourceId) {
    await apiClient.delete(`/v1/resources/${resourceId}`);
  }

  async restoreResource(resourceId) {
    const { data } = await apiClient.post(
      `/admin/resources/${resourceId}/restore`,
    );
    return data;
  }
}

export const adminResourceService = new AdminResourceService();