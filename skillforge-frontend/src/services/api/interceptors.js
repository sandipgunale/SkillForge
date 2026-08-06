import { apiClient } from "./axios";
import { useAuthStore } from "@/store/authStore";

let refreshPromise = null;

/**
 * Single-flight silent refresh: concurrent 401s share one refresh call.
 * On success the new session is pushed into the store; on failure the
 * session is cleared so the caller can redirect to login.
 */
export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh")
      .then((res) => {
        useAuthStore.getState().setSession(res.data);
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

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

  async (error) => {
    const { response, config } = error;

    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/refresh"]
      .some((path) => config?.url?.includes(path));

    // Never refresh for auth endpoints themselves — a failed login
    // or refresh attempt must surface as-is.
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    const { session } = useAuthStore.getState();

    if (!session?.accessToken) {
      useAuthStore.getState().forceLogout();
      window.location.replace("/login");
      return Promise.reject(error);
    }

    // Already retried with a fresh token — give up.
    if (config?._retry) {
      useAuthStore.getState().forceLogout();
      window.location.replace("/login");
      return Promise.reject(error);
    }

    try {
      await refreshAccessToken();

      config._retry = true;

      return apiClient(config);
    } catch {
      useAuthStore.getState().forceLogout();
      window.location.replace("/login");
      return Promise.reject(error);
    }
  }
);
