import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getDifficultyVariant,
  getDifficultyLabel,
} from "../utils/topicDifficulty";

import { Clock, BookMarked, Target, CheckCircle2 } from "lucide-react";

import WeekQuizAction from "./WeekQuizAction";

import { useUpdateWeekCompletion } from "../hooks/useUpdateWeekCompletion";

export default function WeekCard({ learningPathId, week }) {
  const updateWeek = useUpdateWeekCompletion();

  const handleCheckedChange = (checked) => {
    updateWeek.mutate({
      learningPathId,
      weekNumber: week.week,
      completed: Boolean(checked),
    });
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle>Week {week.week}</CardTitle>

            <h3 className="text-lg font-semibold">{week.title}</h3>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />

              <span>{week.estimatedHours} hrs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={week.completed}
              disabled={updateWeek.isPending}
              aria-label={`Mark week ${week.week} as completed`}
              onCheckedChange={handleCheckedChange}
            />

            <Badge variant={week.completed ? "default" : "outline"}>
              {week.completed ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6">
        {/* Topics */}
        <div>
          <div className="space-y-3">
            {(week.topics ?? []).map((topic) => (
              <div
                key={`${week.week}-${topic.name}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{topic.name}</span>

                <Badge variant={getDifficultyVariant(topic.difficulty)}>
                  {getDifficultyLabel(topic.difficulty)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookMarked className="h-5 w-5" />

            <h4 className="font-semibold">Resources</h4>
          </div>

          <div className="space-y-2">
            {(week.resources ?? []).map((resource, index) => (
              <div
                key={`${week.week}-resource-${index}`}
                className="flex items-start gap-2"
              >
                <BookMarked className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{resource.title}</span>

                  <span className="text-xs text-muted-foreground">
                    {resource.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />

            <h4 className="font-semibold">Learning Goals</h4>
          </div>

          <div className="space-y-2">
            {(week.learningGoals ?? []).map((goal, index) => (
              <div
                key={`${week.week}-goal-${index}`}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />

                <p className="text-sm">{goal}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Quiz */}
        <WeekQuizAction learningPathId={learningPathId} week={week} />
      </CardContent>
    </Card>
  );
}
