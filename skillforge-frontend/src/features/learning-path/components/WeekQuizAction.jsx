import { Button } from "@/components/ui/button";
import { Lock, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WeekQuizAction({ learningPathId, week }) {
  const navigate = useNavigate();

  const handleTakeQuiz = () => {
    // Later this will call the backend to generate/fetch the quiz
    navigate(`/learning-paths/${learningPathId}/weeks/${week.week}/quiz`);
  };

  if (!week.completed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        Complete this week to unlock the quiz.
      </div>
    );
  }

  return (
    <Button className="w-full" onClick={handleTakeQuiz}>
      <Brain className="mr-2 h-4 w-4" />
      Take Quiz
    </Button>
  );
}
