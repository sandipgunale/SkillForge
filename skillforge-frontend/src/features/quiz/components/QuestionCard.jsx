import { useRef } from "react";
import { FileQuestion } from "lucide-react";

import QuestionRenderer from "./renderer/QuestionRenderer";
import { useMountAnimation } from "@/lib/motion-gsap";

export default function QuestionCard({ question, selectedAnswer, onAnswer }) {
  const cardRef = useRef(null);

  useMountAnimation(cardRef, [question.id], { y: 16, duration: 0.35 });

  return (
    <div key={question.id} ref={cardRef} className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileQuestion className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {question.type}
          </span>
        </div>

        <p className="display text-xl font-semibold leading-8 sm:text-[1.35rem]">
          {question.content}
        </p>
      </div>

      <QuestionRenderer
        question={question}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
      />
    </div>
  );
}