import { motion } from "framer-motion";

import { EASE_OUT_EXPO } from "@/lib/motion";

export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        )}

        <h1 className="display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2.5 text-base text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0 md:pb-1">{action}</div>
      )}
    </motion.div>
  );
}