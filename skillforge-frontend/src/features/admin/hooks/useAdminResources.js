import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { adminResourceService } from "../api/adminResourceService";
import { QUERY_KEYS } from "@/constants/queryKeys";

const ADMIN_RESOURCES_KEY = ["admin", "resources"];

const getErrorMessage = (error) =>
  error.response?.data?.message ?? "Something went wrong.";

export function useAdminResources(filters = {}) {
  const { search = "", includeInactive = false, page = 0, size = 20 } = filters;

  return useQuery({
    queryKey: [...ADMIN_RESOURCES_KEY, search, includeInactive, page, size],
    queryFn: () =>
      adminResourceService.getResources({
        search,
        active: includeInactive ? undefined : true,
        page,
        size,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}

function useAdminResourceMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_RESOURCES_KEY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateResource() {
  return useAdminResourceMutation(
    (payload) => adminResourceService.createResource(payload),
    "Resource created",
  );
}

export function useUpdateResource() {
  return useAdminResourceMutation(
    ({ resourceId, payload }) =>
      adminResourceService.updateResource(resourceId, payload),
    "Resource updated",
  );
}

export function useDeleteResource() {
  return useAdminResourceMutation(
    (resourceId) => adminResourceService.deleteResource(resourceId),
    "Resource deactivated",
  );
}

export function useRestoreResource() {
  return useAdminResourceMutation(
    (resourceId) => adminResourceService.restoreResource(resourceId),
    "Resource restored",
  );
}