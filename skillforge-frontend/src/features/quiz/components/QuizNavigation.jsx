import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SPRING_TACTILE } from "@/lib/motion";

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

  return (
    <div className="flex items-center justify-between gap-3">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={SPRING_TACTILE}
      >
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={previous}
          className="h-11 rounded-full px-5 sm:px-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Previous
        </Button>
      </motion.div>

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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING_TACTILE}
        >
          <Button
            onClick={next}
            className="h-11 rounded-full px-5 sm:px-6"
          >
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}