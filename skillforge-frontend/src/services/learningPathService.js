import api from "./api";

export const learningPathService = {
  generatePath: (data) =>
    api.post("/learning-paths/generate", data).then((res) => res.data),

  getPaths: () =>
    api.get("/learning-paths").then((res) => res.data),
};