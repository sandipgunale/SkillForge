import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";

export default function QuizProgress({ current, total }) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="mt-7 space-y-2.5">
      <Progress value={percentage} />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Question{" "}
          <motion.span
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block font-semibold text-foreground"
          >
            {current + 1}
          </motion.span>{" "}
          of {total}
        </span>
      </div>
    </div>
  );
}