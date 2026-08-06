import { useQuery } from "@tanstack/react-query";

import { adminApi } from "../api/admin.api";

const ADMIN_QUERY_KEYS = ["admin"];

export function useAdminUsers({ search, page = 0, size = 20 } = {}) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS, "users", { search, page, size }],
    queryFn: () => adminApi.getUsers({ search, page, size }),
    staleTime: 1000 * 60,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS, "stats"],
    queryFn: adminApi.getStats,
    staleTime: 1000 * 60,
  });
}
