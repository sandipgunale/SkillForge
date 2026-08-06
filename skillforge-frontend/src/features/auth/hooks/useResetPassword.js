import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authService } from "../api/authService";
import { ROUTES } from "@/constants/routes";

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password updated. Sign in with your new password.");
      navigate(ROUTES.LOGIN, { replace: true });
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.message ??
          "This reset link is invalid or has expired.",
      );
    },
  });
}
