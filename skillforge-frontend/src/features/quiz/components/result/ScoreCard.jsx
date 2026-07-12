import { Card, CardContent } from "@/components/ui/card";

export default function ScoreCard({ score, maxScore }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">Score</h3>

        <p className="mt-4 text-4xl font-bold">
          {score} / {maxScore}
        </p>
      </CardContent>
    </Card>
  );
}
