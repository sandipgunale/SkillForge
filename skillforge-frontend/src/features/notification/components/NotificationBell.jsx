import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { ROUTES } from "@/constants/routes";

import {
  useNotifications,
  useUnreadCount,
} from "@/features/notification/hooks/useNotifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/notification/hooks/useNotificationMutations";

export default function NotificationBell() {
  const navigate = useNavigate();

  const { data: countData } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = countData?.count ?? 0;

  const NOTIFICATION_ROUTES = {
    BADGE: ROUTES.ACHIEVEMENTS,
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }

    navigate(NOTIFICATION_ROUTES[notification.type] ?? ROUTES.DASHBOARD);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          />
        }
      >
        <BellIcon className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between pr-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          </DropdownMenuGroup>

          {unreadCount > 0 && (
            <DropdownMenuItem
              className="gap-1 text-xs"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheckIcon />
              Mark all read
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "block cursor-pointer whitespace-normal",
                !notification.read && "bg-accent/50"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <p className="text-sm font-medium">{notification.title}</p>

              {notification.message && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {notification.message}
                </p>
              )}

              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
