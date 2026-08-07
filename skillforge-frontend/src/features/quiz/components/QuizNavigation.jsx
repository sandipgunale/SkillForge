import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMicroInteractions } from "@/lib/motion-gsap";

import SubmitDialog from "./SubmitDialog";

export default function QuizNavigation({
  current,
  total,
  answered,
  previous,
  next,
  submit,
  loading,
}) {
  const isLast = current === total - 1;
  const previousRef = useRef(null);
  const nextRef = useRef(null);

  useMicroInteractions(previousRef, { hover: { scale: 1.02 }, tap: { scale: 0.96 } });
  useMicroInteractions(nextRef, { hover: { scale: 1.02 }, tap: { scale: 0.96 } });

  return (
    <div className="flex items-center justify-between gap-3">
      <div ref={previousRef}>
        <Button
variant="outline"
          disabled={current === 0}
          onClick={previous}
          className="h-11 rounded-full px-5 sm:px-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Previous
        </Button>
      </div>

      <p className="hidden text-xs font-medium text-muted-foreground sm:block">
        {answered}/{total} answered
      </p>

      {isLast ? (
        <SubmitDialog
          answered={answered}
          total={total}
          onSubmit={submit}
          loading={loading}
        />
      ) : (
        <div ref={nextRef}>
          <Button
            onClick={next}
            className="h-11 rounded-full px-5 sm:px-6"
          >
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}