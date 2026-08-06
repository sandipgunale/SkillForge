import { apiClient } from "@/services/api/axios";

export const gamificationApi = {
  async getGamification() {
    const { data } = await apiClient.get("/v1/gamification");

    return data;
  },
};
