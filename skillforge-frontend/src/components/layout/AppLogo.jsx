import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

import LogoMark from "@/components/common/LogoMark";

export default function AppLogo({ className }) {
  return (
    <Link
      to={ROUTES.DASHBOARD}
      className={cn(
        "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="SkillForge dashboard"
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        <LogoMark className="size-8" />
      </div>

      <span className="text-base font-bold tracking-tight">SkillForge</span>
    </Link>
  );
}
