import { apiClient } from "@/services/api/axios";

export const profileService = {
  async getProfile() {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },
};
