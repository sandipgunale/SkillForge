import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authService } from "../api/authService";

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onError: (error) => {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    },
  });
}
