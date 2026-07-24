import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

import { calculateProgress } from "../utils/calculateProgress";

export default function LearningPathProgress({ roadmap }) {
  const {
    completedWeeks,

    totalWeeks,

    progress,
  } = calculateProgress(roadmap);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between">
          <h3>Progress</h3>

          <span>{Math.round(progress)}%</span>
        </div>

        <Progress value={progress} />

        <p className="text-sm text-muted-foreground">
          {completedWeeks}/{totalWeeks}
          Weeks Completed
        </p>
      </CardContent>
    </Card>
  );
}
