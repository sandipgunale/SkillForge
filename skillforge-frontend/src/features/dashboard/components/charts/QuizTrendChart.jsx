import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EmptyState from "@/components/common/EmptyState";

export default function QuizTrendChart({ quizzes = [] }) {
  if (!quizzes.length) {
    return (
      <EmptyState
        title="No Quiz History"
        description="Complete your first quiz to see your performance trend."
      />
    );
  }

  const data = quizzes
    .slice()
    .reverse()
    .map((quiz, index) => ({
      quiz: `Quiz ${index + 1}`,
      score: Number(quiz.percentage),
    }));

  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Quiz Performance Trend</CardTitle>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="quiz" />

            <YAxis domain={[0, 100]} allowDecimals={false} />

            <Tooltip formatter={(value) => [`${value}%`, "Score"]} />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
