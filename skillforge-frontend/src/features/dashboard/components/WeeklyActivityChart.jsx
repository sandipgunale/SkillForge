import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { chartPalette } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";

export default function WeeklyActivityChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No Weekly Activity"
        description="Start learning to unlock your weekly progress."
      />
    );
  }

  const palette = chartPalette();

  const totalMinutes = data.reduce((sum, day) => sum + day.minutes, 0);

  const bestDay = data.reduce((a, b) => (a.minutes > b.minutes ? a : b));

  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Weekly Learning Activity</h2>

            <p className="text-sm text-muted-foreground">
              Stay consistent. Small daily progress compounds over time.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/40 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              This Week
            </p>

            <p className="text-2xl font-bold">{totalMinutes} mins</p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="day" />

              <YAxis allowDecimals={false} />

              <Tooltip
                cursor={{ fill: palette[1] ?? undefined, fillOpacity: 0.08 }}
                formatter={(value) => [`${value} mins`, "Study Time"]}
              />

              <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Best Day</p>

            <h3 className="mt-1 text-xl font-bold">{bestDay.day}</h3>

            <p className="text-sm text-muted-foreground">
              {bestDay.minutes} mins studied
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Weekly Goal</p>

            <h3
              className={cn(
                "mt-1 text-xl font-bold",
                totalMinutes >= 300 && "text-success",
              )}
            >
              {totalMinutes >= 300 ? "Achieved" : "In Progress"}
            </h3>

            <p className="text-sm text-muted-foreground">
              Target: 300 mins / week
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
