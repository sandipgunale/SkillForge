import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (data) => {
      login(data);

      toast.success("Welcome back!");

      const from =
        location.state?.from?.pathname || ROUTES.DASHBOARD;

      navigate(from, {
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