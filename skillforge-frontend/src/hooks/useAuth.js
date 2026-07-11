import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { authService } from "@/features/auth/api/authService";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const { login } = useAuthStore();

  const navigate = useNavigate();

  const location = useLocation();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (response) => {
      login(response);

      const from =
        location.state?.from?.pathname ||
        ROUTES.DASHBOARD;

      navigate(from, {
        replace: true,
      });
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();

  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,

    onSuccess: (response) => {
      login(response);

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },
  });
}