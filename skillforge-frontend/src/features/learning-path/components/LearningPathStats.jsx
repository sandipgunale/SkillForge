import { useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { CalendarCheck, BookMarked, Brain, Gauge } from "lucide-react";

import { useNumeralRoll } from "@/lib/motion-gsap";

export default function LearningPathStats({
  completedWeeks,
  totalWeeks,
  totalResources,
  completedQuizzes,
  totalQuizzes,
  averageScore,
}) {
  const weeksRef = useRef(null);
  const resourcesRef = useRef(null);
  const quizzesRef = useRef(null);
  const scoreRef = useRef(null);

  useNumeralRoll(weeksRef, { to: completedWeeks, duration: 0.8 });
  useNumeralRoll(resourcesRef, { to: totalResources, duration: 0.8 });
  useNumeralRoll(quizzesRef, { to: completedQuizzes, duration: 0.8 });
  useNumeralRoll(scoreRef, {
    to: completedQuizzes > 0 ? Math.round(averageScore) : 0,
    duration: 0.8,
    suffix: "%",
    visible: completedQuizzes > 0,
  });

  const stats = [
    {
      label: "Weeks",
      value: (
        <>
          <span ref={weeksRef}>0</span> / {totalWeeks}
        </>
      ),
      icon: CalendarCheck,
    },
    {
      label: "Resources",
      value: <span ref={resourcesRef}>0</span>,
      icon: BookMarked,
    },
    {
      label: "Quizzes",
      value: (
        <>
          <span ref={quizzesRef}>0</span> / {totalQuizzes}
        </>
      ),
      icon: Brain,
    },
    {
      label: "Avg Score",
      value:
        completedQuizzes > 0 ? <span ref={scoreRef}>0</span> : "—",
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
