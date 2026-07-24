import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { authService } from "../api/authService";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";

export function useRegister() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: authService.register,

    onSuccess: (data) => {
      login(data);

      toast.success("Account created successfully!");

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          "Registration failed."
      );
    },
  });
}