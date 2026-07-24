import api from "@/lib/api";

export const profileService = {
  async getProfile() {
    const response = await api.get("/users/me");
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put("/users/me", data);
    return response.data;
  },
};