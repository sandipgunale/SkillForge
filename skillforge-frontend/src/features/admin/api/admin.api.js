import { apiClient } from "@/services/api/axios";

export const adminApi = {
  async getUsers({ search, page = 0, size = 20, sort } = {}) {
    const { data } = await apiClient.get("/admin/users", {
      params: {
        ...(search ? { search } : {}),
        ...(sort ? { sort } : {}),
        page,
        size,
      },
    });

    return data;
  },

  async updateUser(userId, payload) {
    const { data } = await apiClient.put(
      `/admin/users/${userId}`,
      payload
    );

    return data;
  },

  async getStats() {
    const { data } = await apiClient.get("/admin/stats");

    return data;
  },
};
