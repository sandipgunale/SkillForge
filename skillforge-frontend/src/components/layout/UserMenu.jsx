import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/store/authStore";

export default function UserMenu() {
  const { user } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right md:block">
        <p className="font-medium">{user?.fullName || "Guest"}</p>

        <p className="text-sm text-muted-foreground">
          {user?.role || "Visitor"}
        </p>
      </div>

      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
