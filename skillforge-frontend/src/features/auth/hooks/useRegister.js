import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { authService } from "../api/authService";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import { useAuthSceneStore } from "@/features/auth/store/authSceneStore";

export function useRegister() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const setBusy = useAuthSceneStore((state) => state.setBusy);

  return useMutation({
    mutationFn: authService.register,

    onMutate: () => {
      setBusy(true);
    },

    onSuccess: (data) => {
      login(data);

      toast.success("Account created successfully!");

      // Let the success morph + accelerated core play before the switch
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, {
          replace: true,
        });
      }, 750);
    },

    onSettled: () => {
      setBusy(false);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          "Registration failed."
      );
    },
  });
}