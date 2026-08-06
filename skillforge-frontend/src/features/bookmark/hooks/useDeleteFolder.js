import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId) => bookmarkApi.deleteFolder(folderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARK_FOLDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS });
      toast.success("Folder deleted");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to delete folder."
      );
    },
  });
}
