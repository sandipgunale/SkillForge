import { useQuery } from "@tanstack/react-query";

import { resourceApi } from "../api/resource.api";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useResource(id) {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCE(id),

    queryFn: () => resourceApi.getResource(id),

    enabled: !!id,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 2,

    refetchOnWindowFocus: false,
  });
}