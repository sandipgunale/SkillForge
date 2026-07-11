import { apiClient } from "./api/axios";

export const authService = {
  /**
   * Authenticate user
   *
   * @param {{
   *   email: string,
   *   password: string
   * }} credentials
   *
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    const response = await apiClient.post(
      "/auth/login",
      credentials
    );

    return response.data;
  },
};