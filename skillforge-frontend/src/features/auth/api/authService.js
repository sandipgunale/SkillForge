import api from "../../../services/api";

export const authService = {
  register: (data) =>
    api.post("/auth/register", data).then((res) => res.data),

  login: (data) =>
    api.post("/auth/login", data).then((res) => res.data),

  logout: () =>
    api.post("/auth/logout").then((res) => res.data),

  refresh: () =>
    api.post("/auth/refresh").then((res) => res.data),

  getProfile: () =>
    api.get("/users/me").then((res) => res.data),

  updateProfile: (data) =>
    api.put("/users/me", data).then((res) => res.data),
};