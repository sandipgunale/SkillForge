import api from "./api";

export const analyticsService = {
  getDashboard: () =>
    api.get("/analytics/dashboard").then((res) => res.data),

  updateProgress: (topicId, data) =>
    api.put(`/progress/${topicId}`, data).then((res) => res.data),
};