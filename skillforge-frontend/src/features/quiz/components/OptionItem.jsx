import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { SPRING_TACTILE } from "@/lib/motion";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function OptionItem({ label, selected, onClick, index }) {
  const handleClick = useCallback(() => {
    onClick(label);
  }, [label, onClick]);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={selected ? undefined : { scale: 1.012 }}
      whileTap={selected ? undefined : { scale: 0.985 }}
      transition={SPRING_TACTILE}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors duration-200",
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/40",
        )}
      >
        {LETTERS[index] ?? index + 1}
      </span>

      <span className="flex-1 text-[0.95rem] leading-relaxed">{label}</span>

      {/* Selection check */}
      <motion.span
        initial={false}
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={SPRING_TACTILE}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </motion.span>
    </motion.button>
  );
}

export default memo(OptionItem);