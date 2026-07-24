import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningPathId,
      payload,
    }) =>
      learningPathApi.updateLearningPath(
        learningPathId,
        payload
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATHS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATH(
          variables.learningPathId
        ),
      });

      toast.success(
        "Learning path updated successfully."
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to update learning path."
      );
    },
  });
}