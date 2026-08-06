import { Textarea } from "@/components/ui/textarea";

export default function InterviewQuestion({ selectedAnswer, onAnswer }) {
  return (
    <Textarea
      value={selectedAnswer ?? ""}
      onChange={(event) => onAnswer(event.target.value)}
      placeholder="Type your interview answer here..."
      rows={6}
    />
  );
}
