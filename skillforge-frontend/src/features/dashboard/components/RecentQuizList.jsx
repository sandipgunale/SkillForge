import { CheckCircle2 } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppCard from "@/components/common/AppCard";

export default function RecentQuizList({ quizzes }) {
  return (
    <AppCard>
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
                      {new Date(quiz.completedAt).toLocaleDateString()}
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
