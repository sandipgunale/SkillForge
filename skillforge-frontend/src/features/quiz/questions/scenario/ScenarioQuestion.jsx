import { Textarea } from "@/components/ui/textarea";

export default function ScenarioQuestion({ selectedAnswer, onAnswer }) {
  return (
    <Textarea
      value={selectedAnswer ?? ""}
      onChange={(event) => onAnswer(event.target.value)}
      placeholder="Describe how you would handle this scenario..."
      rows={6}
    />
  );
}
