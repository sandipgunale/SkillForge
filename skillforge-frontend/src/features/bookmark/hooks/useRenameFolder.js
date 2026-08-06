import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, name }) =>
      bookmarkApi.renameFolder(folderId, name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOOKMARK_FOLDERS,
      });

      toast.success("Folder renamed");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to rename folder."
      );
    },
  });
}
