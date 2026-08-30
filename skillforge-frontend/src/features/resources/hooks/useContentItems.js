import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { contentItemApi } from "../api/contentItem.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useContentItems(resourceId, includeInactive = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONTENT_ITEMS(resourceId), includeInactive],
    queryFn: () => contentItemApi.getContentItems(resourceId, includeInactive),
    enabled: !!resourceId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

const getErrorMessage = (error) =>
  error.response?.data?.message ?? "Something went wrong.";

function useContentItemMutation(mutationFn, resourceId, successMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONTENT_ITEMS(resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RESOURCE(resourceId),
      });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateContentItem(resourceId) {
  return useContentItemMutation(
    (payload) => contentItemApi.createContentItem(resourceId, payload),
    resourceId,
    "Content added",
  );
}

export function useUpdateContentItem(resourceId) {
  return useContentItemMutation(
    ({ contentItemId, payload }) =>
      contentItemApi.updateContentItem(contentItemId, payload),
    resourceId,
    "Content updated",
  );
}

export function useDeleteContentItem(resourceId) {
  return useContentItemMutation(
    (contentItemId) => contentItemApi.deleteContentItem(contentItemId),
    resourceId,
    "Content removed",
  );
}

export function useReorderContentItems(resourceId) {
  return useContentItemMutation(
    (orderedIds) => contentItemApi.reorderContentItems(resourceId, orderedIds),
    resourceId,
    "Order updated",
  );
}
