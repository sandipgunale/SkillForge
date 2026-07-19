import { useQuery } from "@tanstack/react-query";

import { ratingApi } from "../api/rating.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUserRating(resourceId) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_RATING(resourceId),

    queryFn: () =>
      ratingApi.getUserRating(resourceId),

    enabled: !!resourceId,

    staleTime: 1000 * 60 * 5,
  });
}