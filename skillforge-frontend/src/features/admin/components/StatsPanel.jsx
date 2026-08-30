import { BookOpen, Layers, ListChecks, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

import { useAdminStats } from "../hooks/useAdminData";

const META = [
  { key: "totalUsers", label: "Total users", icon: Users },
  { key: "totalTopics", label: "Topics", icon: Layers },
  { key: "totalResources", label: "Resources", icon: BookOpen },
  { key: "completedQuizzes", label: "Quizzes completed", icon: ListChecks },
];

export default function StatsPanel() {
  const { data: stats } = useAdminStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {META.map(({ key, label, icon: Icon }) => (
        <StatCard
          key={key}
          icon={<Icon className="size-5" />}
          label={label}
          value={stats?.[key] ?? 0}
        />
      ))}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-[0_18px_44px_-18px_color-mix(in_oklch,var(--ember)_26%,transparent)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background:
            "linear-gradient(90deg, var(--ember), color-mix(in oklch, var(--ember) 35%, var(--aurora)))",
        }}
      />
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ember/10 text-ember transition-colors group-hover:bg-ember/15">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}
