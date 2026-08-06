import { Link } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BookmarkIcon,
  LogOutIcon,
  RouteIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";

import { useAuth } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/features/auth/hooks/useLogout";

export default function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-md p-1 outline-none ring-ring transition focus-visible:ring-2 data-[popup-open]:bg-accent">
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium leading-tight">
            {user?.fullName || "Guest"}
          </p>

          <p className="text-xs text-muted-foreground">
            {user?.role || "Visitor"}
          </p>
        </div>

        <Avatar className="size-9">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate text-sm font-medium">
              {user?.fullName || "Guest"}
            </p>

            <p className="truncate text-xs font-normal text-muted-foreground">
              {user?.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to={ROUTES.PROFILE} />}>
            <UserIcon />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to={ROUTES.LEARNING_PATH} />}>
            <RouteIcon />
            Learning Paths
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to={ROUTES.BOOKMARKS} />}>
            <BookmarkIcon />
            Bookmarks
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to={ROUTES.ACHIEVEMENTS} />}>
            <TrophyIcon />
            Achievements
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}