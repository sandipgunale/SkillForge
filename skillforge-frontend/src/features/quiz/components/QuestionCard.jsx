import { useRef } from "react";

import QuestionRenderer from "./renderer/QuestionRenderer";
import QuestionHeader from "./QuestionHeader";
import { useMountAnimation } from "@/lib/motion-gsap";

export default function QuestionCard({
  question,
  index,
  total,
  difficulty,
  topic,
  selectedAnswer,
  onAnswer,
}) {
  const cardRef = useRef(null);

  useMountAnimation(cardRef, [question.id], { y: 16, duration: 0.35 });

  return (
    <div key={question.id} ref={cardRef} className="space-y-6">
      <QuestionHeader
        index={index}
        total={total}
        type={question.type}
        difficulty={difficulty}
        topic={topic}
      />

      <QuestionRenderer
        question={question}
        index={index}
        total={total}
        difficulty={difficulty}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
      />
    </div>
  );
}
