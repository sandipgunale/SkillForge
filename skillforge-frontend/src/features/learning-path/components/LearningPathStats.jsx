import { Card, CardContent } from "@/components/ui/card";

import { CalendarCheck, BookMarked, Brain, Gauge } from "lucide-react";

export default function LearningPathStats({
  completedWeeks,
  totalWeeks,
  totalResources,
  completedQuizzes,
  totalQuizzes,
  averageScore,
}) {
  const stats = [
    {
      label: "Weeks",
      value: `${completedWeeks} / ${totalWeeks}`,
      icon: CalendarCheck,
    },
    {
      label: "Resources",
      value: totalResources,
      icon: BookMarked,
    },
    {
      label: "Quizzes",
      value: `${completedQuizzes} / ${totalQuizzes}`,
      icon: Brain,
    },
    {
      label: "Avg Score",
      value:
        completedQuizzes > 0
          ? `${Math.round(averageScore)}%`
          : "—",
      icon: Gauge,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-bold">{stat.value}</p>

                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
