import { apiClient } from "@/services/api/axios";

export const notificationApi = {
  async getNotifications(unreadOnly = false) {
    const { data } = await apiClient.get("/v1/notifications", {
      params: { unreadOnly },
    });

    return data;
  },

  async getUnreadCount() {
    const { data } = await apiClient.get("/v1/notifications/unread-count");

    return data;
  },

  async markRead(notificationId) {
    const { data } = await apiClient.patch(
      `/v1/notifications/${notificationId}/read`
    );

    return data;
  },

  async markAllRead() {
    const { data } = await apiClient.patch("/v1/notifications/read-all");

    return data;
  },
};
