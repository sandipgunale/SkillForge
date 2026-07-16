import HeroSkeleton from "./HeroSkeleton";
import StatsGridSkeleton from "./StatsGridSkeleton";
import ChartSkeleton from "./ChartSkeleton";
import CardSkeleton from "./CardSkeleton";

export default function DashboardSkeleton() {
  return (
    <main className="space-y-8">
      <HeroSkeleton />

      <StatsGridSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ChartSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
}
