import { useQuery } from "@tanstack/react-query";

import { learningPathApi } from "../api/learningPath.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useLearningPaths() {
  return useQuery({
    queryKey: QUERY_KEYS.LEARNING_PATHS,
    queryFn: learningPathApi.getLearningPaths,
  });
}