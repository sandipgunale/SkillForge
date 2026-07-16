import { Clock3, BrainCircuit, Trophy, BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const stats = (analytics) => [
  {
    title: "Study Time",
    value: analytics.studyHours,
    icon: Clock3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Health Score",
    value: `${analytics.learningHealthScore}/100`,
    icon: BrainCircuit,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Average Score",
    value: `${analytics.overallAverageScore}%`,
    icon: Trophy,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Topics Started",
    value: analytics.totalTopicsStarted,
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function StatsGrid({ analytics }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats(analytics).map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>

                <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
              </div>

              <div className={`rounded-xl p-4 ${item.bg}`}>
                <Icon className={`h-7 w-7 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
