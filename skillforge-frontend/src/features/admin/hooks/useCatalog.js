import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { catalogService } from "../api/catalogService";
import { QUERY_KEYS } from "@/constants/queryKeys";

const getErrorMessage = (error) =>
  error.response?.data?.message ?? "Something went wrong.";

export function useTopicsList() {
  return useQuery({
    queryKey: QUERY_KEYS.TOPICS,
    queryFn: catalogService.getTopics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTagsList() {
  return useQuery({
    queryKey: ["admin", "tags"],
    queryFn: catalogService.getTags,
    staleTime: 1000 * 60 * 5,
  });
}

function useCatalogMutation(mutationFn, invalidateKeys, successMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateTopic() {
  return useCatalogMutation(
    (payload) => catalogService.createTopic(payload),
    [QUERY_KEYS.TOPICS, ["admin", "stats"]],
    "Topic created",
  );
}

export function useUpdateTopic() {
  return useCatalogMutation(
    ({ topicId, payload }) => catalogService.updateTopic(topicId, payload),
    [QUERY_KEYS.TOPICS],
    "Topic updated",
  );
}

export function useDeleteTopic() {
  return useCatalogMutation(
    (topicId) => catalogService.deleteTopic(topicId),
    [QUERY_KEYS.TOPICS, ["admin", "stats"]],
    "Topic deleted",
  );
}

export function useCreateTag() {
  return useCatalogMutation(
    (payload) => catalogService.createTag(payload),
    [["admin", "tags"]],
    "Tag created",
  );
}

export function useUpdateTag() {
  return useCatalogMutation(
    ({ tagId, payload }) => catalogService.updateTag(tagId, payload),
    [["admin", "tags"]],
    "Tag updated",
  );
}

export function useDeleteTag() {
  return useCatalogMutation(
    (tagId) => catalogService.deleteTag(tagId),
    [["admin", "tags"]],
    "Tag deleted",
  );
}
