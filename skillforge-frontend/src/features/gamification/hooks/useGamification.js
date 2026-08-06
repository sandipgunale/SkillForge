import { useQuery } from "@tanstack/react-query";

import { gamificationApi } from "../api/gamification.api";

export const GAMIFICATION_QUERY_KEYS = ["gamification"];

export function useGamification() {
  return useQuery({
    queryKey: GAMIFICATION_QUERY_KEYS,
    queryFn: gamificationApi.getGamification,
    staleTime: 1000 * 60 * 5,
  });
}
