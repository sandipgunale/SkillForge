import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Trophy, CalendarCheck, BookMarked, Brain, Link2 } from "lucide-react";

import { toast } from "sonner";

export default function CompletionCard({
  learningPath,
  completedWeeks,
  totalWeeks,
  totalResources,
  completedQuizzes,
  averageScore,
}) {
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);

        toast.success("Achievement link copied!");

        return;
      }
    } catch {
      // fall through
    }

    toast.error("Could not copy link.");
  };

  const stats = [
    {
      label: "Weeks Completed",
      value: `${completedWeeks}/${totalWeeks}`,
      icon: CalendarCheck,
    },
    {
      label: "Resources",
      value: totalResources,
      icon: BookMarked,
    },
    {
      label: "Quizzes",
      value: completedQuizzes,
      icon: Brain,
    },
    {
      label: "Overall Score",
      value:
        completedQuizzes > 0
          ? `${Math.round(averageScore)}%`
          : "—",
      icon: Trophy,
    },
  ];

  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="flex flex-col items-center gap-5 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <Trophy className="h-8 w-8 text-success" />
        </div>

        <div>
          <p className="text-xl font-bold">
            Congratulations! 🎉
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {learningPath.title} completed.
          </p>
        </div>

        <Badge variant="secondary">{learningPath.status}</Badge>

        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="space-y-1">
                <Icon className="mx-auto h-5 w-5 text-success" />

                <p className="text-lg font-bold">{stat.value}</p>

                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={handleShare}>
          <Link2 className="mr-2 h-4 w-4" />
          Share Achievement
        </Button>
      </CardContent>
    </Card>
  );
}
