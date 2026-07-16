import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppCard from "@/components/common/AppCard";
import EmptyState from "@/components/common/EmptyState";

export default function ContinueLearningCard({ topic }) {
  if (!topic) {
    return (
      <EmptyState
        title="No topic data"
        description="Complete some quizzes to unlock analytics."
      />
    );
  }

  return (
    <AppCard className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <BookOpen size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">Continue Learning</h2>

            <p className="text-sm text-muted-foreground">
              Pick up where you left off
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold">{topic.topicName}</h3>

          <p className="text-sm text-muted-foreground">
            {topic.minutesSpent} minutes learned
          </p>
        </div>

        <Progress value={topic.completionPercentage} className="h-3" />

        <div className="flex items-center justify-between text-sm">
          <span>{topic.completionPercentage}% Completed</span>

          <span>Avg {topic.averageScore}%</span>
        </div>

        <Button className="w-full">
          Resume Learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </AppCard>
  );
}
