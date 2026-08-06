import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Brain, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

function quizPercentage(quiz) {
  if (!quiz || !quiz.maxScore) return 0;

  return Math.round((quiz.score / quiz.maxScore) * 100);
}

export default function WeekQuizAction({ learningPathId, week, locked, quiz }) {
  const navigate = useNavigate();

  const handleTakeQuiz = () => {
    navigate(ROUTES.QUIZ_SETUP, {
      state: {
        source: "LEARNING_PATH",
        learningPathId,
        weekNumber: week.week,
      },
    });
  };

  const handleReview = () => {
    navigate(ROUTES.QUIZ_RESULT.replace(":quizId", quiz.id));
  };

  if (locked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        Unlock after completing Week {week.week - 1}
      </div>
    );
  }

  if (quiz) {
    const percentage = quizPercentage(quiz);

    return (
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="default">{percentage}%</Badge>

          <span className="text-sm text-muted-foreground">
            {quiz.status === "COMPLETED"
              ? "Completed"
              : "In Progress"}{" "}
            {quiz.score}/{quiz.maxScore}
          </span>
        </div>

        {quiz.status === "COMPLETED" && (
          <Button variant="outline" size="sm" onClick={handleReview}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Review Quiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button className="w-full sm:w-auto" onClick={handleTakeQuiz}>
      <Brain className="mr-2 h-4 w-4" />
      Generate Quiz
    </Button>
  );
}
