import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { bookmarkApi } from "../api/bookmark.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }) => bookmarkApi.createFolder(name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARK_FOLDERS });
      toast.success("Folder created");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to create folder."
      );
    },
  });
}
