import { useQuery } from "@tanstack/react-query";

import { resourcesApi } from "../api/resources.api";
import { QUERY_KEYS } from "@/constants/queryKeys";
export function useResources(filters) {
  return useQuery({
   queryKey:[
    ...QUERY_KEYS.RESOURCES,
    filters
],

    queryFn: () => resourcesApi.getResources(filters),

    staleTime: 1000 * 60 * 5,

    placeholderData: (previousData) => previousData,
  });
}