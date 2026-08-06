import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Lightbulb, ArrowRight } from "lucide-react";

export default function LearningPathRecommendation({
  weeks,
  weakQuiz,
  onContinue,
}) {
  if (!weakQuiz?.week) return null;

  const weakWeek = weeks.find(
    (week) => week.week === weakQuiz.week,
  );

  if (!weakWeek) return null;

  const firstTopic = weakWeek.topics?.[0]?.name ?? weakWeek.title;

  const estimatedMinutes = Math.max(
    5,
    Math.round(((weakWeek.estimatedHours ?? 2) * 60) / 4),
  );

  return (
    <Card className="border-info/30 bg-info/5">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/15">
            <Lightbulb className="h-5 w-5 text-info" />
          </div>

          <div>
            <p className="font-semibold">AI Recommendation</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your lowest score in Week {weakWeek.week} (
              {Math.round(weakQuiz.percentage)}%). Before moving on, review{" "}
              <span className="font-medium text-foreground">
                {firstTopic}
              </span>{" "}
              once more — estimated {estimatedMinutes} minutes.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onContinue?.(weakWeek.week)}
          className="shrink-0"
        >
          Review Week {weakWeek.week}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
