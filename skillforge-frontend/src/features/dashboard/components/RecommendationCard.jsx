import { useNavigate } from "react-router-dom";
import { BrainCircuit, Sparkles, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import RecommendationItem from "./RecommendationItem";
import EmptyState from "@/components/common/EmptyState";

import { ROUTES } from "@/constants/routes";

export default function RecommendationCard({ recommendations = [] }) {
  const navigate = useNavigate();

  if (!recommendations.length) {
    return (
      <EmptyState
        title="You're doing great"
        description="No AI recommendations right now. Keep learning consistently!"
      />
    );
  }

  return (
    <Card className="group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <BrainCircuit className="h-7 w-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">AI Mentor</h2>

                <Sparkles className="h-4 w-4 text-warning" />
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Personalised suggestions based on your recent learning activity.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Based on your latest quiz performance, these recommendations will
            help improve your weakest concepts and increase your overall
            learning health.
          </p>
        </div>

        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationItem
              key={`${recommendation.title}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </div>

        <Button
          className="w-full gap-2"
          variant="secondary"
          onClick={() => navigate(ROUTES.LEARNING_PATHS)}
        >
          View Learning Plan
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
