import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronsLeft, Pin } from "lucide-react";

import AppLogo from "@/components/layout/AppLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { getNavigationSections, ROLE_LABELS } from "@/config/navigation";
import { useAuth } from "@/store/authStore";

import { useMagnetic } from "@/lib/dashboard-motion";

import { ROUTES } from "@/constants/routes";

/* ==========================================================================
   Mission Shell — the primary chrome of SkillForge.
   A glass, collapsible left rail (desktop) reused inside the mobile sheet.

   - Role-driven navigation sections
   - Collapsible: rail -> icon rail by clicking the chevron
   - Magnetic hover (pointer pull) on every primary item
   - Animated active indicator (embers on the active path)
   - Keyboard: Up/Down/Home/End move focus within the rail
   - Pinned favorites (per user, localStorage) shown above the sections
   - Recent activity (local "last visited") under the rail
   ========================================================================== */

const PIN_KEY = "skillforge:pinned";
const RECENT_KEY = "skillforge:recent";

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export default function MissionContent({
  collapsed = false,
  onToggleCollapse,
  className,
}) {
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const railRef = useRef(null);
  const [pinned, setPinned] = useState(() => readJson(PIN_KEY, []));
  const [recent, setRecent] = useState(() => readJson(RECENT_KEY, []));

  useEffect(() => {
    writeJson(PIN_KEY, pinned);
  }, [pinned]);

  const togglePin = (path) =>
    setPinned((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );

  const recordVisit = (path) => {
    if (!path) return;
    setRecent((prev) => {
      const next = [path, ...prev.filter((p) => p !== path)].slice(0, 4);
      writeJson(RECENT_KEY, next);
      return next;
    });
  };

  const sections = getNavigationSections(role);

  const allItems = sections.flatMap((section) => section.items);

  const pinnedItems = allItems.filter((item) => pinned.includes(item.path));

  const recentItems = allItems.filter((item) => recent.includes(item.path));

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  const roles = ["STUDENT", "INSTRUCTOR", "ADMIN"];

  const workspacePaths = {
    STUDENT: ROUTES.WORKSPACE,
    INSTRUCTOR: ROUTES.INSTRUCTOR,
    ADMIN: ROUTES.ADMIN,
  };

  const switchWorkspace = (targetRole) => {
    if (targetRole === role) return;
    navigate(workspacePaths[targetRole]);
    recordVisit(workspacePaths[targetRole]);
  };

  /* Roving keyboard focus: Up/Down/Home/End move focus within the rail.
     All other keys (Enter, Space, Tab, Shift+Tab, letters) are left to
     native behavior so links stay activatable and focus can escape. */
  const handleKeyDown = (event) => {
    if (!railRef.current) return;
    const { key } = event;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) return;
    const links = Array.from(
      railRef.current.querySelectorAll("a[href], button[data-rail]"),
    ).filter((el) => el.offsetParent !== null);
    const index = links.indexOf(document.activeElement);
    if (index === -1) return;

    let next;
    if (key === "ArrowDown") next = Math.min(index + 1, links.length - 1);
    else if (key === "ArrowUp") next = Math.max(index - 1, 0);
    else if (key === "Home") next = 0;
    else next = links.length - 1;

    event.preventDefault();
    links[next]?.focus();
  };

  return (
    <div
      ref={railRef}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        const link = event.target.closest?.("a[href]");
        if (link) recordVisit(link.getAttribute("href"));
      }}
      className={cn("flex h-full flex-col gap-4 overflow-y-auto p-3", className)}
    >
      {/* Logo */}
      <div className="px-1.5 pt-1">
        <AppLogo className={collapsed ? "justify-center" : ""} />
      </div>

      {/* Pinned favorites */}
      {!collapsed && pinnedItems.length > 0 && (
        <section aria-label="Pinned" className="space-y-1">
          <p className="px-2 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Pinned
          </p>
          <ul className="space-y-1">
            {pinnedItems.map((item) => (
              <MissionLink
                key={item.path}
                {...item}
                collapsed={collapsed}
                active={location.pathname === item.path}
                pinned
                onPin={() => togglePin(item.path)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Navigation */}
      {sections.map((section) => (
        <nav key={section.label} aria-label={section.label} className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {section.label}
            </p>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => (
              <MissionLink
                key={item.path}
                {...item}
                collapsed={collapsed}
                active={location.pathname === item.path}
                pinned={pinned.includes(item.path)}
                onPin={() => togglePin(item.path)}
              />
            ))}
          </ul>
        </nav>
      ))}

      <div className="flex-1" />

      {/* Recent activity */}
      {!collapsed && recentItems.length > 0 && (
        <section aria-label="Recent activity" className="space-y-1">
          <p className="px-2 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Recent
          </p>
          <ul className="space-y-1">
            {recentItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
                    location.pathname === item.path && "text-ember",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Workspace switcher */}
      {!collapsed && (
        <div className="rounded-xl border bg-background/40 p-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Workspace
            </span>
            <span className="rounded-full bg-ember/15 px-2 py-0.5 text-3xs font-semibold text-ember">
              {ROLE_LABELS[role] ?? role ?? "Learner"}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchWorkspace(r)}
                aria-label={`Open ${ROLE_LABELS[r]} workspace`}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  role === r
                    ? "bg-ember/10 text-ember"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <button
          type="button"
          data-rail
          onClick={onToggleCollapse}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
        >
          <ChevronsLeft
            className={cn(
              "size-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && "Collapse"}
        </button>
      )}

      {/* User */}
      <div className="rounded-xl border bg-background/40 p-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-ember/15 text-xs font-semibold text-ember">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                {user?.fullName || "Guest"}
              </p>
              <p className="truncate text-[0.6875rem] text-muted-foreground">
                {ROLE_LABELS[role] || role || "Visitor"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MissionLink({
  title,
  path,
  icon: Icon,
  collapsed,
  active,
  pinned,
  onPin,
}) {
  const ref = useRef(null);
  useMagnetic(ref, { strength: 0.22, radius: 120 });

  return (
    <li className="group relative">
      <NavLink
        ref={ref}
        to={path}
        className={cn(
          "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-2",
          active
            ? "bg-primary/12 text-ember"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute -left-2.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-ember"
          />
        )}
        <Icon
          className={cn(
            "size-[18px] transition-transform duration-300",
            !collapsed && "group-hover:scale-110",
            active && "text-ember",
          )}
        />
        {!collapsed && <span className="flex-1 truncate">{title}</span>}
      </NavLink>

      {!collapsed && pinned && (
        <button
          type="button"
          onClick={onPin}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ember opacity-0 transition-opacity duration-200 hover:bg-ember/10 focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={`Unpin ${title}`}
        >
          <Pin className="size-3.5" />
        </button>
      )}
    </li>
  );
}