import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { adminApi } from "../api/admin.api";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }) =>
      adminApi.updateUser(userId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to update user."
      );
    },
  });
}
