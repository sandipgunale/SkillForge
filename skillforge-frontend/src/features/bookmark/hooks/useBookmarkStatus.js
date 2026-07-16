import { useQuery } from "@tanstack/react-query";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useBookmarkStatus(resourceId) {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKMARK_STATUS(resourceId),

    queryFn: () =>
      bookmarkApi.getBookmarkStatus(resourceId),

    enabled: !!resourceId,

    staleTime: 1000 * 60 * 5,
  });
}