import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { profileService } from "../api/profileService";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/store/authStore";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: profileService.updateProfile,

    onSuccess: (user) => {
      updateUser(user);

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE],
      });

      toast.success("Profile updated successfully.");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          "Unable to update profile."
      );
    },
  });
}