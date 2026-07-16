import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

export default function WeeklyActivityChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No Weekly Activity"
        description="Start learning to view your weekly study activity."
      />
    );
  }

  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Weekly Learning Activity</h3>

          <p className="text-sm text-muted-foreground">
            Minutes spent learning during the last 7 days.
          </p>
        </div>

        <div className="h-87.5 w-full">
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

              <Tooltip formatter={(value) => [`${value} mins`, "Study Time"]} />

              <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
