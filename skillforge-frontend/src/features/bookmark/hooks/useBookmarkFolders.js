import { useQuery } from "@tanstack/react-query";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useBookmarkFolders() {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKMARK_FOLDERS,
    queryFn: bookmarkApi.getFolders,
    staleTime: 1000 * 60 * 5,
  });
}
