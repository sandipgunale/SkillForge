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

import { Trophy, Target, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { cssColor } from "@/lib/chart-colors";

const getColor = (score) => {
  if (score >= 85) return cssColor("--chart-4");
  if (score >= 70) return cssColor("--chart-2");
  if (score >= 50) return cssColor("--warning");
  return cssColor("--destructive");
};

export default function TopicMasteryChart({ topics = [] }) {
  if (!topics.length) {
    return (
      <EmptyState
        title="No Topic Analytics"
        description="Complete quizzes to unlock your topic mastery insights."
      />
    );
  }

  const data = topics.map((topic) => ({
    topic:
      topic.topicName.length > 12
        ? topic.topicName.slice(0, 12) + "..."
        : topic.topicName,
    score: Number(topic.averageScore),
    fullName: topic.topicName,
  }));

  const average = Math.round(
    data.reduce((sum, item) => sum + item.score, 0) / data.length,
  );

  const best = data.reduce((a, b) => (a.score > b.score ? a : b));

  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>Topic Mastery</CardTitle>

          <GraduationCap className="h-5 w-5 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            icon={<Trophy className="h-4 w-4" />}
            label="Best Topic"
            value={best.fullName}
          />

          <SummaryCard
            icon={<Target className="h-4 w-4" />}
            label="Average Mastery"
            value={`${average}%`}
          />
        </div>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="topic" tick={{ fontSize: 12 }} />

            <YAxis domain={[0, 100]} allowDecimals={false} />

            <Tooltip
              formatter={(value) => [`${value}%`, "Mastery"]}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.fullName || label
              }
            />

            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="text-lg font-bold truncate">{value}</p>
    </div>
  );
}
