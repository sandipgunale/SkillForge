import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ratingApi } from "../api/rating.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useRateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, value }) =>
      ratingApi.rateResource(resourceId, value),

  onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.USER_RATING(variables.resourceId),
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.RESOURCE(variables.resourceId),
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.RESOURCES,
  });

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.BOOKMARKS,
  });

  toast.success("Rating saved successfully.");
},

    onError: () => {
      toast.error("Failed to save rating.");
    },
  });
}