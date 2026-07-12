import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function QuestionCountSelector({ register }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="questionCount">Number of Questions</Label>

      <Input
        id="questionCount"
        type="number"
        min={1}
        max={20}
        {...register("questionCount", {
          valueAsNumber: true,
        })}
      />
    </div>
  );
}
