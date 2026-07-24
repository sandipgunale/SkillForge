import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: learningPathApi.createLearningPath,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATHS,
      });

      toast.success(
        "Learning path created successfully."
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to create learning path."
      );
    },
  });
}