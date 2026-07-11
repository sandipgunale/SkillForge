import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

export function useLogin() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (credentials) => {
      return await authService.login(credentials);
    },

    onSuccess: (data) => {
      login(data);

      toast.success("Welcome back!");

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },

    onError: (error) => {
      console.error("Login Error:", error);

      toast.error(
        error.response?.data?.message ??
          "Invalid email or password."
      );
    },
  });
}