import AppCard from "@/components/common/AppCard";
import { CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <AppCard>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>

          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="rounded-xl bg-primary/10 p-4 text-primary">{icon}</div>
      </CardContent>
    </AppCard>
  );
}
