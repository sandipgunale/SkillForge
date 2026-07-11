import { apiClient } from "@/services/api/axios";

export const dashboardApi = {
  async getDashboardAnalytics() {
    const response = await apiClient.get("/v1/analytics/dashboard");

    // Return only business data
    return response.data.data;
  },
};