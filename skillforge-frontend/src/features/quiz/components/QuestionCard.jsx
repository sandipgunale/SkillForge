import { AnimatePresence, motion } from "framer-motion";
import { FileQuestion } from "lucide-react";

import QuestionRenderer from "./renderer/QuestionRenderer";
import { EASE_OUT_EXPO } from "@/lib/motion";

export default function QuestionCard({ question, selectedAnswer, onAnswer }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
        className="space-y-6"
      >
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
      </motion.div>
    </AnimatePresence>
  );
}