import {
  Clock,
  Target,
  Brain,
  ListChecks,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export default function OverviewPanel() {
  const { data } = useDashboard();

  const stats = [
    {
      icon: <Clock className="size-4" />,
      label: "Study time",
      value: data?.studyHours ?? "0m",
    },
    {
      icon: <ListChecks className="size-4" />,
      label: "Quizzes taken",
      value: data?.totalQuizzesTaken ?? 0,
    },
    {
      icon: <Target className="size-4" />,
      label: "Topics started",
      value: data?.totalTopicsStarted ?? 0,
    },
    {
      icon: <Brain className="size-4" />,
      label: "Avg score",
      value: data?.overallAverageScore
        ? `${Number(data.overallAverageScore).toFixed(0)}%`
        : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{stat.icon}</span>
                {stat.label}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="size-4 text-muted-foreground" />
            Learning health
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Health score</span>
            <span className="font-semibold">
              {data?.learningHealthScore ?? 0}
              <span className="text-muted-foreground">/100</span>
            </span>
          </div>

          <Progress value={data?.learningHealthScore ?? 0} />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quiz accuracy</span>
            <span className="font-semibold">
              {data?.quizAccuracy ? `${Number(data.quizAccuracy).toFixed(0)}%` : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {data?.weakAreas?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-warning" />
              Suggested focus areas
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {data.weakAreas.map((area) => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
