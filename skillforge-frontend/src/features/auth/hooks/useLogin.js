import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";

import { toast } from "sonner";

import { authService } from "../api/authService";
import { useAuthStore } from "@/store/authStore";
import { useAuthSceneStore } from "@/features/auth/store/authSceneStore";
import { ROUTES } from "@/constants/routes";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((state) => state.login);
  const setBusy = useAuthSceneStore((state) => state.setBusy);

  return useMutation({
    mutationFn: authService.login,

    onMutate: () => {
      setBusy(true);
    },

    onSuccess: (data) => {
      login(data);

      toast.success("Welcome back!");

      const from =
        location.state?.from?.pathname || ROUTES.DASHBOARD;

      // Let the success morph + accelerated core play before the switch
      setTimeout(() => {
        navigate(from, {
          replace: true,
        });
      }, 750);
    },

    onSettled: () => {
      setBusy(false);
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