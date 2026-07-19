import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useResource(id) {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCE(id),

    queryFn: () => resourcesApi.getResourceById(id),

    enabled: !!id,

    staleTime: 1000 * 60 * 5,
  });
}