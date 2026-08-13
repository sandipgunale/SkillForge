import { CheckCircle2, Flame, LayoutDashboard, LineChart } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  DashboardMock — the live dashboard preview from the landing, condensed    */
/*  to fit a book page. Real product surface: health score, weekly bars,      */
/*  momentum chip.                                                            */
/* -------------------------------------------------------------------------- */

const PREVIEW_FEATURES = [
  "One focused workspace, zero tab soup",
  "Paths, quizzes, health score — in one place",
  "Progress that proves itself",
];

const BAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const BAR_HEIGHTS = [34, 58, 42, 76, 52, 88, 66];

export default function DashboardMock({ className = "" }) {
  return (
    <div
      className={`w-full overflow-hidden rounded-xl border bg-card shadow-lg ${className}`}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-2 flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-0.5 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          app.skillforge.io/dashboard
        </div>
      </div>

      <div className="grid grid-cols-[7.5rem_1fr]">
        <div className="hidden border-r bg-muted/25 p-3 sm:block">
          <div className="flex items-center gap-2 px-1">
            <span className="flex size-6 items-center justify-center rounded-lg bg-ember text-white">
              <Flame className="size-3.5" />
            </span>
            <span className="text-xs font-semibold tracking-tight">SkillForge</span>
          </div>
          <nav className="mt-4 space-y-1">
            {["Dashboard", "Analytics", "Quizzes", "Paths"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] ${
                  i === 0
                    ? "bg-ember/12 font-semibold text-ember"
                    : "text-muted-foreground"
                }`}
              >
                {i === 0 && <LayoutDashboard className="size-3" />}
                {i === 1 && <LineChart className="size-3" />}
                <span>{item}</span>
              </div>
            ))}
          </nav>
          <div className="mt-5 rounded-lg border bg-card p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Learning health
            </p>
            <p className="mt-0.5 text-lg font-bold text-ember">82</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-ember to-aurora" />
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">This week</p>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              +12% momentum
            </span>
          </div>
          <div className="mt-2.5 flex h-16 items-end gap-1.5">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={`${i}-${BAR_DAYS[i]}`}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-md ${
                    i === 5
                      ? "bg-gradient-to-t from-ember to-aurora"
                      : "bg-muted-foreground/25"
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[8px] text-muted-foreground">{BAR_DAYS[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {PREVIEW_FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-[10px] text-muted-foreground"
              >
                <CheckCircle2 className="size-3 shrink-0 text-ember" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}