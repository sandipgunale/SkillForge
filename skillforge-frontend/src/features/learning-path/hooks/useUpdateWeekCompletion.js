import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useUpdateWeekCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningPathId,
      weekNumber,
      completed,
    }) =>
      learningPathApi.updateWeekCompletion(
        learningPathId,
        weekNumber,
        completed
      ),

    onSuccess: (updatedLearningPath) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATHS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LEARNING_PATH(
          updatedLearningPath.id
        ),
      });

      toast.success(
        "Week updated successfully."
      );
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          "Failed to update week."
      );
    },
  });
};