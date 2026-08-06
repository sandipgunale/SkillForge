import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

import { TrendingUp, Trophy, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { cssColor } from "@/lib/chart-colors";

export default function QuizTrendChart({ quizzes = [] }) {
  if (!quizzes.length) {
    return (
      <EmptyState
        title="No Quiz History"
        description="Complete your first quiz to unlock your performance analytics."
      />
    );
  }

  const data = quizzes
    .slice()
    .reverse()
    .map((quiz, index) => ({
      quiz: `#${index + 1}`,
      score: Number(quiz.percentage),
    }));

  const latest = data[data.length - 1]?.score ?? 0;

  const best = Math.max(...data.map((q) => q.score));

  const average = Math.round(
    data.reduce((sum, q) => sum + q.score, 0) / data.length,
  );

  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>Quiz Performance Trend</CardTitle>

          <TrendingUp className="h-5 w-5 text-primary" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat
            icon={<Target className="h-4 w-4" />}
            label="Latest"
            value={`${latest}%`}
          />

          <Stat
            icon={<Trophy className="h-4 w-4" />}
            label="Best"
            value={`${best}%`}
          />

          <Stat
            icon={<TrendingUp className="h-4 w-4" />}
            label="Average"
            value={`${average}%`}
          />
        </div>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="quiz" />

            <YAxis domain={[0, 100]} allowDecimals={false} />

            <Tooltip formatter={(value) => [`${value}%`, "Score"]} />

            <ReferenceLine
              y={average}
              stroke={cssColor("--muted-foreground")}
              strokeDasharray="4 4"
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke={cssColor("--chart-1")}
              strokeWidth={3}
              dot={{
                r: 5,
                fill: cssColor("--chart-1"),
              }}
              activeDot={{
                r: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
