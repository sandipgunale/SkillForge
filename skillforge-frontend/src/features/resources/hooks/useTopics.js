import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.TOPICS,

    queryFn: resourcesApi.getTopics,

    staleTime: Infinity,
  });
}