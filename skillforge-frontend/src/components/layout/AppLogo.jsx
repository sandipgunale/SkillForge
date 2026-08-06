import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

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
        <Flame className="size-[18px]" />
      </div>

      <span className="text-base font-bold tracking-tight">SkillForge</span>
    </Link>
  );
}
