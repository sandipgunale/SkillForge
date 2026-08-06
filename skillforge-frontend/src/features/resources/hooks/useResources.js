import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { resourcesService } from "../api/resourcesService";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useResources(filters = {}) {
  const {
    topicId = null,
    difficulty = null,
    type = null,
    search = "",
    page = 0,
    size = 12,
  } = filters;

  return useQuery({
    queryKey: [
      ...QUERY_KEYS.RESOURCES,
      topicId,
      difficulty,
      type,
      search,
      page,
      size,
    ],

    queryFn: () =>
      resourcesService.getResources({
        topicId,
        difficulty,
        type,
        search,
        page,
        size,
      }),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 2,

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    refetchOnMount: false,
  });
}