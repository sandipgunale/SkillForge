import { Card, CardContent } from "@/components/ui/card";

export default function FeedbackCard({ feedback }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">AI Feedback</h3>

        <p className="leading-8 text-muted-foreground">
          {feedback || "No AI feedback available."}
        </p>
      </CardContent>
    </Card>
  );
}
