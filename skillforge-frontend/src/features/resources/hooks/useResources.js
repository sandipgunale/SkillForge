import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { resourcesService } from "../api/resourcesService";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useResources(filters) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.RESOURCES,
      filters,
    ],

    queryFn: () => resourcesService.getResources(filters),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 2,

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    refetchOnMount: false,
  });
}