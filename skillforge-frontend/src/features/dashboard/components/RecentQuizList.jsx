import { CheckCircle2 } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppCard from "@/components/common/AppCard";
import { formatDate } from "@/utils/date";
import EmptyState from "@/components/common/EmptyState";

export default function RecentQuizList({ quizzes }) {
  if (!quizzes || quizzes.length === 0) {
    return (
      <EmptyState
        title="No Quiz History"
        description="Complete your first quiz to see your recent activity."
      />
    );
  }

  return (
    <AppCard className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Recent Quiz Activity</CardTitle>
      </CardHeader>

      <CardContent>
        {quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No quizzes attempted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" size={22} />

                  <div>
                    <p className="font-semibold">{quiz.topicName}</p>

                    <p className="text-sm text-muted-foreground">
                      {formatDate(quiz.completedAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">{quiz.percentage}%</p>

                  <p className="text-xs text-muted-foreground">
                    {quiz.score}/{quiz.maxScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </AppCard>
  );
}
