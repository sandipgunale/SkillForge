import { Card, CardContent } from "@/components/ui/card";

import RecommendationItem from "./RecommendationItem";
import EmptyState from "@/components/common/EmptyState";

export default function RecommendationCard({ recommendations = [] }) {
  if (!recommendations.length) {
    return (
      <EmptyState
        title="No Recommendations"
        description="Complete more quizzes to get personalized recommendations."
      />
    );
  }
  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">AI Recommendations</h3>

          <p className="text-sm text-muted-foreground">
            Personalized suggestions to improve your learning.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-muted-foreground">
              🎉 No recommendations. You're doing great!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={`${recommendation.title}-${index}`}
                recommendation={recommendation}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
