import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function InsightsCard({ analytics }) {
  const health = analytics.learningHealthScore;

  const momentum =
    health >= 85 ? "Excellent" : health >= 70 ? "Good" : "Needs Improvement";

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Brain className="h-7 w-7 text-primary" />
          </div>

          <div>
            <h2 className="text-xl font-bold">AI Learning Insights</h2>

            <p className="text-sm text-muted-foreground">
              Personalised analysis of your learning behaviour.
            </p>
          </div>
        </div>

        <Insight
          icon={TrendingUp}
          title="Current Momentum"
          value={momentum}
          description="Based on your recent quiz performance and study consistency."
        />

        <Insight
          icon={Target}
          title="Strongest Area"
          value={analytics.mostActiveTopic}
          description="You've spent the most time mastering this topic."
        />

        <Insight
          icon={AlertTriangle}
          title="Focus Area"
          value={analytics.weakAreas?.[0] ?? "No major weak areas"}
          description="Improving this topic will increase your learning health."
        />

        <Insight
          icon={Sparkles}
          title="AI Recommendation"
          value="Stay consistent"
          description="Even 20–30 minutes of daily learning creates long-term improvement."
        />
      </CardContent>
    </Card>
  );
}

function Insight({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-xl border p-4 transition hover:bg-muted/40">
      <div className="flex gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h3 className="font-semibold">{title}</h3>

          <p className="mt-1 text-lg font-bold">{value}</p>

          <p className="mt-1 text-sm text-muted-foreground leading-6">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
