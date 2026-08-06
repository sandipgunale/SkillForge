import { NavLink } from "react-router-dom";

import AppLogo from "./AppLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { getNavigationSections, ROLE_LABELS } from "@/config/navigation";
import { useAuth } from "@/store/authStore";

function SidebarContent({ onNavigate }) {
  const { user, role } = useAuth();

  const sections = getNavigationSections(role);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1">
        <AppLogo />
      </div>

      <nav className="flex flex-1 flex-col gap-6" aria-label="Primary">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <p className="px-3 text-[0.6875rem] font-semibold tracking-widest text-muted-foreground/70 uppercase">
              {section.label}
            </p>

            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "size-[18px] transition-transform duration-200 group-hover:scale-110",
                            isActive && "text-primary-foreground",
                          )}
                        />
                        {item.title}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/70" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="rounded-xl border bg-background/60 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.fullName || "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[role] || role || "Visitor"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-background/80 backdrop-blur lg:block">
      <SidebarContent />
    </aside>
  );
}

export { SidebarContent };
