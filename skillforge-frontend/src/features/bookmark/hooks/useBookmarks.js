import { useQuery } from "@tanstack/react-query";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useBookmarks({ folderId, page = 0, size = 12 } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKMARKS, { folderId, page, size }],
    queryFn: () => bookmarkApi.getBookmarks({ folderId, page, size }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
}
