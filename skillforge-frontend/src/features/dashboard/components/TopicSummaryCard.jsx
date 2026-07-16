import { Trophy, TrendingDown, Clock3, BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

export default function TopicSummaryCard({ title, topic, variant = "best" }) {
  if (!topic) {
    return (
      <EmptyState
        title="No topic data"
        description="Complete some quizzes to unlock analytics."
      />
    );
  }

  const Icon = variant === "best" ? Trophy : TrendingDown;

  const iconColor = variant === "best" ? "text-yellow-500" : "text-orange-500";

  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${iconColor}`} />

          <div>
            <h3 className="font-semibold text-lg">{title}</h3>

            <p className="text-sm text-muted-foreground">{topic.topicName}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">Average Score</p>

            <p className="mt-2 text-2xl font-bold">{topic.averageScore}%</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />

              <span className="text-xs text-muted-foreground">Quizzes</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{topic.quizzesTaken}</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />

              <span className="text-xs text-muted-foreground">Minutes</span>
            </div>

            <p className="mt-2 text-2xl font-bold">{topic.minutesSpent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
