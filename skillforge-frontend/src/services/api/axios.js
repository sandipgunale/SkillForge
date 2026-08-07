import axios from "axios";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 120000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Automatically unwrap Spring Boot ApiResponse<T>
 *
 * Backend Response:
 * {
 *   success: true,
 *   message: "...",
 *   data: ...
 * }
 *
 * Frontend receives only:
 * data
 */
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      Object.prototype.hasOwnProperty.call(response.data, "data")
    ) {
      response.data = response.data.data;
    }

    return response;
  },
  (error) => Promise.reject(error)
);