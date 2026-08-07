import { useQuery } from "@tanstack/react-query";

import { resourceApi } from "../api/resource.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.TOPICS,

    queryFn: () => resourceApi.getTopics(),

    staleTime: Infinity,

    gcTime: Infinity,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}