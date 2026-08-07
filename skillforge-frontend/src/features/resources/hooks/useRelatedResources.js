import { useQuery } from "@tanstack/react-query";

import { resourceApi } from "../api/resource.api";

export function useRelatedResources(
  topicId,
  currentResourceId
) {
  return useQuery({
    queryKey: [
      "related-resources",
      topicId,
      currentResourceId,
    ],

    queryFn: () =>
      resourceApi.getRelatedResources(
        topicId,
        currentResourceId
      ),

    enabled: !!topicId && !!currentResourceId,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}