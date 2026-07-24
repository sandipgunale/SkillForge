import { useQuery } from "@tanstack/react-query";

import { profileService } from "../api/profileService";

import { QUERY_KEYS } from "@/constants/queryKeys";

export function useProfile() {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE],

    queryFn: profileService.getProfile,

    staleTime: 1000 * 60 * 10,
  });
}