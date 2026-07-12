import { Progress } from "@/components/ui/progress";

export default function QuizProgress({ current, total }) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="space-y-2">
      <Progress value={percentage} />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Question {current + 1}</span>

        <span>{total}</span>
      </div>
    </div>
  );
}
