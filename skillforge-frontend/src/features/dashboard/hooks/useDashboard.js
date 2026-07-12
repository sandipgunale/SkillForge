import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDashboard() {
  return useQuery({
   queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: dashboardApi.getDashboardAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}