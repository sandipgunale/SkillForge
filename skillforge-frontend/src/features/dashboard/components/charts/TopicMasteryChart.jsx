import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EmptyState from "@/components/common/EmptyState";

export default function TopicMasteryChart({ topics = [] }) {
  if (!topics.length) {
    return (
      <EmptyState
        title="No Topic Analytics"
        description="Complete quizzes to see your topic mastery."
      />
    );
  }

  const data = topics.map((topic) => ({
    topic: topic.topicName,
    score: Number(topic.averageScore),
  }));

  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Topic Mastery</CardTitle>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="topic" />

            <YAxis domain={[0, 100]} allowDecimals={false} />

            <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />

            <Bar dataKey="score" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
