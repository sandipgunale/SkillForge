import { useQuery } from "@tanstack/react-query";

import { resourcesService } from "../api/resourcesService";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useResource(id) {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCE(id),

    queryFn: () =>
      resourcesService.getResourceById(id),

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 2,

    refetchOnWindowFocus: false,
  });
}