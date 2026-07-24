import { useQuery } from "@tanstack/react-query";

import { resourcesService } from "../api/resourcesService";

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
      resourcesService.getRelatedResources(
        topicId,
        currentResourceId
      ),

    enabled: Boolean(topicId),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,
  });
}