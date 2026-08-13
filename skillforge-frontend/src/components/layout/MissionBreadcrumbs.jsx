import { useMemo, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { getNavigationSections } from "@/config/navigation";
import { useAuth } from "@/store/authStore";
import { useMountAnimation } from "@/lib/motion-gsap";
import { ROUTES } from "@/constants/routes";

export default function MissionBreadcrumbs() {
  const { role } = useAuth();
  const location = useLocation();
  const crumbRef = useRef(null);

  useMountAnimation(crumbRef, [location.pathname], { x: -10, duration: 0.4 });

  const sections = useMemo(() => getNavigationSections(role), [role]);

  const segment = useMemo(() => {
    const match = sections
      .flatMap((section) => section.items)
      .find((item) => item.path === location.pathname);
    if (match) return match.title;
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Mission Control";
    return parts
      .join(" ")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [sections, location.pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-1.5 text-sm lg:flex"
    >
      <NavLink
        to={ROUTES.DASHBOARD}
        className="font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Forge
      </NavLink>
      <ChevronRight className="size-3.5 text-muted-foreground/50" />
      <span ref={crumbRef} className="max-w-56 truncate font-semibold">
        {segment}
      </span>
    </nav>
  );
}