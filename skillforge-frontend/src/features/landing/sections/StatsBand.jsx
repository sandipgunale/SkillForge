import { motion } from "framer-motion";
import { Activity, Brain, Flame, Users } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import { staggerContainer, staggerItem } from "@/lib/motion";

const STATS = [
  {
    icon: Users,
    label: "Active learners",
    value: 12400,
    suffix: "+",
  },
  {
    icon: Flame,
    label: "Quizzes completed",
    value: 356000,
    suffix: "+",
  },
  {
    icon: Activity,
    label: "Mastery check-ins",
    value: 92000,
    suffix: "+",
  },
  {
    icon: Brain,
    label: "AI feedback answers",
    value: 187000,
    suffix: "+",
  },
];

export default function StatsBand() {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2.5rem] border bg-card px-8 py-14 lg:px-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_100%_at_85%_0%,color-mix(in_oklch,var(--aurora)_8%,transparent)_0%,transparent_60%)]"
          />

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STATS.map(({ icon: Icon, label, value, suffix }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className="flex items-center gap-4"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ember/12 text-ember">
                  <Icon className="size-6" />
                </div>

                <div>
                  <p className="display text-3xl font-bold tracking-tight tabular-nums">
                    <CountUp to={value} suffix={suffix} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}