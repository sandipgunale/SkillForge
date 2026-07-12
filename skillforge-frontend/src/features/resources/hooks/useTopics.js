import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],

    queryFn: resourcesApi.getTopics,

    staleTime: Infinity,
  });
}