import { useRef } from "react";

import { Progress } from "@/components/ui/progress";
import { useMountAnimation } from "@/lib/motion-gsap";

export default function QuizProgress({ current, total }) {
  const percentage = ((current + 1) / total) * 100;
  const counterRef = useRef(null);

  useMountAnimation(counterRef, [current], { y: 6, duration: 0.25 });

  return (
    <div className="mt-7 space-y-2.5">
      <Progress value={percentage} />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Question{" "}
          <span
            key={current}
            ref={counterRef}
            className="inline-block font-semibold text-foreground"
          >
            {current + 1}
          </span>{" "}
          of {total}
        </span>
      </div>
    </div>
  );
}