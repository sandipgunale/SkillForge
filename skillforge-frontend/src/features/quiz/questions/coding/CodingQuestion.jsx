import { Textarea } from "@/components/ui/textarea";

export default function CodingQuestion({ selectedAnswer, onAnswer }) {
  return (
    <Textarea
      value={selectedAnswer ?? ""}
      onChange={(event) => onAnswer(event.target.value)}
      placeholder="Write your code here..."
      rows={8}
      className="font-mono"
    />
  );
}
