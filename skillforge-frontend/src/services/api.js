import axios from "axios";
import { env } from "@/config/env";

const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically attach JWT Access Token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 *
 * We'll implement automatic refresh-token flow
 * after Authentication module is completed.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    // Future:
    // 401 -> Refresh Token -> Retry Request

    return Promise.reject(error);
  }
);

export default api;