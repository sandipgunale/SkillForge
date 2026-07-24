import { useQuery } from "@tanstack/react-query";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useLearningPath(learningPathId) {
  return useQuery({
    queryKey: QUERY_KEYS.LEARNING_PATH(
      learningPathId
    ),

    queryFn: () =>
      learningPathApi.getLearningPath(
        learningPathId
      ),

    enabled: !!learningPathId,
  });
}