import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";

export function useRelatedResources(topicId, currentResourceId) {
  return useQuery({
    queryKey: ["related-resources", topicId, currentResourceId],

    queryFn: () =>
      resourcesApi.getRelatedResources(topicId, currentResourceId),

    enabled: !!topicId,

    staleTime: 1000 * 60 * 5,
  });
}