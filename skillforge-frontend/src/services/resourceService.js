import api from "./api";

export const resourceService = {
  getResources: (params) =>
    api.get("/resources", { params }).then((res) => res.data),

  getResourceById: (id) =>
    api.get(`/resources/${id}`).then((res) => res.data),

  getTopics: () =>
    api.get("/topics").then((res) => res.data),

  getBookmarks: () =>
    api.get("/bookmarks").then((res) => res.data),

  addBookmark: (resourceId) =>
    api.post("/bookmarks", { resourceId }).then((res) => res.data),

  removeBookmark: (bookmarkId) =>
    api.delete(`/bookmarks/${bookmarkId}`).then((res) => res.data),
};