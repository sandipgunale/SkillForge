import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";

export function useResources(filters) {
  return useQuery({
    queryKey: ["resources", filters],

    queryFn: () => resourcesApi.getResources(filters),

    staleTime: 1000 * 60 * 5,

    placeholderData: (previousData) => previousData,
  });
}