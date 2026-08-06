import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Trophy, Brain } from "lucide-react";

export default function LearningPathSidebar({
  progress,
  completedWeeks,
  totalWeeks,
  currentWeek,
  nextTopic,
  onContinue,
}) {

  const remaining = totalWeeks - completedWeeks;

  const items = [
    {
      label: "Current Progress",
      value: `${Math.round(progress)}%`,
    },
    {
      label: "Current Week",
      value: currentWeek
        ? `Week ${currentWeek.week}`
        : "—",
    },
    {
      label: "Next Topic",
      value: nextTopic ?? "—",
    },
    {
      label: "Remaining Weeks",
      value: remaining,
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="font-semibold">Current Progress</p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="text-muted-foreground">
                {item.label}
              </span>

              <span className="truncate font-medium">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!currentWeek}
          onClick={() => onContinue?.()}
        >
          <Brain className="mr-2 h-4 w-4" />
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );
}
