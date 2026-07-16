import { useQuery } from "@tanstack/react-query";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useBookmarks() {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKMARKS,
    queryFn: bookmarkApi.getBookmarks,
    staleTime: 1000 * 60 * 5,
  });
}