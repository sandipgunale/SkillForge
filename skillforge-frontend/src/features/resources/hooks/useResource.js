import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";

export function useResource(id) {
  return useQuery({
    queryKey: ["resource", id],

    queryFn: () => resourcesApi.getResourceById(id),

    enabled: !!id,

    staleTime: 1000 * 60 * 5,
  });
}