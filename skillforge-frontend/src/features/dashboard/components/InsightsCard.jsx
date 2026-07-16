import { Brain, Activity, Clock3, Target, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

function InsightItem({ icon: Icon, title, value }) {
  if (!value) {
    return (
      <EmptyState
        title="No insights available"
        description="Complete some quizzes to unlock insights."
      />
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 transition hover:bg-muted/40">
      <div className="rounded-lg bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{title}</p>

        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function InsightsCard({ analytics }) {
  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">Learning Insights</h3>

          <p className="text-sm text-muted-foreground">
            AI generated overview of your learning journey.
          </p>
        </div>

        <InsightItem
          icon={Brain}
          title="Learning Level"
          value={analytics.learningLevel}
        />

        <InsightItem
          icon={Activity}
          title="Health Score"
          value={`${analytics.learningHealthScore}/100`}
        />

        <InsightItem
          icon={Target}
          title="Quiz Accuracy"
          value={`${analytics.quizAccuracy}%`}
        />

        <InsightItem
          icon={Clock3}
          title="Study Time"
          value={analytics.studyHours}
        />

        <InsightItem
          icon={GraduationCap}
          title="Most Active Topic"
          value={analytics.mostActiveTopic}
        />
      </CardContent>
    </Card>
  );
}
