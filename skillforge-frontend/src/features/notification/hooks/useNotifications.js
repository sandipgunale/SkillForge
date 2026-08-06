import { useQuery } from "@tanstack/react-query";

import { notificationApi } from "../api/notification.api";

export const NOTIFICATION_QUERY_KEYS = {
  LIST: ["notifications"],
  UNREAD_COUNT: ["notifications", "unread-count"],
};

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.LIST, { unreadOnly }],
    queryFn: () => notificationApi.getNotifications(unreadOnly),
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.UNREAD_COUNT,
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 1000 * 60 * 5,
  });
}
