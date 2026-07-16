import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkApi.addBookmark,

    onSuccess: (_, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOOKMARKS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOOKMARK_STATUS(resourceId),
      });

      toast.success("Resource bookmarked successfully.");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          "Failed to bookmark resource."
      );
    },
  });
}