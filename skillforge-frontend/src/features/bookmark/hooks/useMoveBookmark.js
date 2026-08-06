import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useMoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, folderId }) =>
      bookmarkApi.moveBookmark(resourceId, folderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARK_FOLDERS });
      toast.success("Bookmark moved");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to move bookmark."
      );
    },
  });
}
