import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Clock3, Trophy, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import AppCard from "@/components/common/AppCard";
import EmptyState from "@/components/common/EmptyState";

import { ROUTES } from "@/constants/routes";

export default function ContinueLearningCard({ topic }) {
  const navigate = useNavigate();

  if (!topic) {
    return (
      <EmptyState
        title="Nothing to continue"
        description="Complete a quiz to unlock your personalised learning path."
      />
    );
  }

  const progress = topic.completionPercentage ?? 0;

  const resume = () => {
    navigate(`${ROUTES.RESOURCES}?topicId=${encodeURIComponent(topic.topicId)}`);
  };

  return (
    <AppCard className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary transition-transform duration-300 group-hover:scale-110">
              <BookOpen className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Continue Learning
              </p>

              <h2 className="text-2xl font-bold">{topic.topicName}</h2>
            </div>
          </div>

          <PlayCircle className="h-8 w-8 text-primary opacity-80" />
        </div>

        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="mb-3 flex justify-between text-sm">
            <span className="font-medium">Course Progress</span>

            <span className="font-semibold">{progress}%</span>
          </div>

          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />

              <span className="text-sm">Study Time</span>
            </div>

            <p className="text-xl font-bold">{topic.minutesSpent} mins</p>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />

              <span className="text-sm">Average Score</span>
            </div>

            <p className="text-xl font-bold">{topic.averageScore}%</p>
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            Keep going! You're making consistent progress in this topic.
            Completing it will improve your overall learning health.
          </p>
        </div>

        <Button className="w-full gap-2" size="lg" onClick={resume}>
          Resume Learning
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </AppCard>
  );
}
