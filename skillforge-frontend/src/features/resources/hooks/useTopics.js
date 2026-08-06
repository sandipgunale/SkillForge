import { useQuery } from "@tanstack/react-query";

import { resourcesService } from "../api/resourcesService";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.TOPICS,

    queryFn: () => resourcesService.getTopics(),

    staleTime: Infinity,

    gcTime: Infinity,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}