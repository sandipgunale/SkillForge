import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ratingApi } from "../api/rating.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId) =>
      ratingApi.deleteRating(resourceId),

onSuccess: (_, resourceId) => {
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.USER_RATING(resourceId),
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.RESOURCE(resourceId),
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.RESOURCES,
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.BOOKMARKS,
  });

  toast.success("Rating removed successfully.");
},
    onError: () => {
  toast.error("Failed to remove rating.");
},
  });
}