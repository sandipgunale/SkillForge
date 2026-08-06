import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { authService } from "../api/authService";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

export function useLogout() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    },

    onError: () => {
      // Best-effort: clear local session even if the server call fails.
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}