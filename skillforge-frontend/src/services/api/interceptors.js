import { apiClient } from "./axios";
import { useAuthStore } from "@/store/authStore";

apiClient.interceptors.request.use(
  (config) => {
    const session = useAuthStore.getState().session;

    if (session?.accessToken) {
      config.headers.Authorization =
        `${session.tokenType} ${session.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);