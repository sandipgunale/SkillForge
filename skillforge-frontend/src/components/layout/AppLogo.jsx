import { GraduationCap } from "lucide-react";

export default function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-primary p-2 text-primary-foreground">
        <GraduationCap className="h-6 w-6" />
      </div>

      <div>
        <h1 className="text-lg font-bold tracking-tight">SkillForge</h1>

        <p className="text-xs text-muted-foreground">Learn • Practice • Grow</p>
      </div>
    </div>
  );
}
