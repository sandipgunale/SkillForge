import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      learningPathApi.deleteLearningPath,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATHS,
      });

      toast.success(
        "Learning path deleted successfully."
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to delete learning path."
      );
    },
  });
}