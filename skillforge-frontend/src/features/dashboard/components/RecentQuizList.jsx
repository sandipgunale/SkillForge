import { CheckCircle2, TrendingUp, Award, CalendarDays } from "lucide-react";

import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import AppCard from "@/components/common/AppCard";
import EmptyState from "@/components/common/EmptyState";

import { formatDate } from "@/utils/date";

function getPerformance(score) {
  if (score >= 90)
    return {
      label: "Excellent",
      variant: "default",
    };

  if (score >= 75)
    return {
      label: "Good",
      variant: "secondary",
    };

  return {
    label: "Needs Practice",
    variant: "destructive",
  };
}

export default function RecentQuizList({ quizzes = [] }) {
  if (!quizzes.length) {
    return (
      <EmptyState
        title="No Recent Activity"
        description="Take your first quiz to begin your learning journey."
      />
    );
  }

  const latest = quizzes[0];

  return (
    <AppCard className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>Learning Timeline</CardTitle>

          <TrendingUp className="h-5 w-5 text-primary" />
        </div>

        <div className="rounded-xl border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Latest Quiz</p>

          <p className="mt-1 text-xl font-bold">{latest.topicName}</p>

          <p className="text-sm text-muted-foreground">
            {latest.percentage}% Score
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {quizzes.map((quiz) => {
            const performance = getPerformance(quiz.percentage);

            return (
              <div key={quiz.quizId} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="mt-2 h-full w-px bg-border" />
                </div>

                <div className="flex-1 rounded-xl border p-4 transition hover:bg-muted/40">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{quiz.topicName}</h3>

                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />

                        {formatDate(quiz.completedAt)}
                      </div>
                    </div>

                    <Badge variant={performance.variant}>
                      {performance.label}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />

                      <span className="font-semibold">
                        {quiz.score}/{quiz.maxScore}
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-primary">
                      {quiz.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </AppCard>
  );
}
