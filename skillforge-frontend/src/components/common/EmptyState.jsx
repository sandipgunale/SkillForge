import { Flame } from "lucide-react";
import { motion } from "framer-motion";

import { SPRING_SOFT } from "@/lib/motion";

export default function EmptyState({ icon, title, description, action }) {
  const Icon = icon ?? Flame;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/40 px-6 text-center"
    >
      <motion.div
        whileHover={{ scale: 1.06, rotate: -3 }}
        transition={SPRING_SOFT}
        className="relative mb-6"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-2xl bg-ember/20 blur-2xl"
        />
        <div className="flex size-16 items-center justify-center rounded-2xl border bg-card text-ember shadow-sm">
          <Icon className="size-8" strokeWidth={1.75} />
        </div>
      </motion.div>

      <h3 className="display text-xl font-bold">{title}</h3>

      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}