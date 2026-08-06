import { motion } from "framer-motion";
import { CircleDot, Hammer, Flame, RefreshCw } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { staggerList, staggerListItem } from "@/lib/motion";

const LOOP = [
  {
    icon: CircleDot,
    step: "01",
    title: "Focus",
    tagline: "The path is set — distractions fall away.",
    body: "A structured path built from the best existing resources — sequenced, filtered, and stripped of every distraction.",
  },
  {
    icon: Hammer,
    step: "02",
    title: "Practice",
    tagline: "Active recall, on demand.",
    body: "AI-generated quizzes adapted to your topic, difficulty, and schedule. Active recall beats passive watching, every time.",
  },
  {
    icon: RefreshCw,
    step: "03",
    title: "Feedback",
    tagline: "Right or wrong is only half the story.",
    body: "Instant AI evaluation of every answer — not just right or wrong, but why, with personalized feedback for each question.",
  },
  {
    icon: Flame,
    step: "04",
    title: "Momentum",
    tagline: "Progress you can see, and keep.",
    body: "Badges, streaks, weekly digests, and a learning-health score that make progress visible and keep you coming back.",
  },
];

export default function MethodSection() {
  return (
    <section id="method" className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,color-mix(in_oklch,var(--ember)_7%,transparent)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="The method"
          title="The Forge Loop"
          description="People don't fail because they lack material — they fail because they lose the loop. Focus → Practice → Feedback → Momentum. Repeat."
        />

        <div className="relative mt-20">
          {/* Connecting rail (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ember/30 to-transparent lg:block"
          />

          <motion.ol
            variants={staggerList(0.14)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-12 lg:space-y-0"
          >
            {LOOP.map(({ icon: Icon, step, title, tagline, body }, index) => {
              const onLeft = index % 2 === 0;

              return (
                <motion.li
                  key={step}
                  variants={staggerListItem}
                  className="relative lg:grid lg:grid-cols-2 lg:gap-24"
                >
                  {/* Knot on rail */}
                  <div
                    aria-hidden="true"
                    className="absolute left-7 top-7 z-10 hidden size-3 -translate-x-1/2 rounded-full bg-ember shadow-[0_0_0_5px_color-mix(in_oklch,var(--ember)_18%,transparent)] lg:left-1/2 lg:block"
                  />

                  {/* Mobile rail */}
                  <div
                    aria-hidden="true"
                    className="absolute left-7 top-2 h-full w-px -translate-x-1/2 bg-gradient-to-b from-ember/40 to-transparent lg:hidden"
                  />

                  <div
                    className={`lg:flex ${
                      onLeft ? "lg:order-1 lg:justify-end" : "lg:order-2 lg:justify-start"
                    }`}
                  >
                    <div
                      className={`group flex gap-5 pl-16 lg:w-[86%] lg:pl-0 ${
                        onLeft ? "lg:pr-2" : "lg:pl-2"
                      }`}
                    >
                      {/* Icon stage */}
                      <div className="relative shrink-0">
                        <div className="flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                          <Icon className="size-6 text-ember" />
                        </div>
                        <span className="absolute -right-2.5 -top-2.5 flex size-6 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-bold text-primary-foreground">
                          {step}
                        </span>
                      </div>

                      <div className="pt-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {step} · {title}
                        </p>
                        <h3 className="display mt-1.5 text-2xl font-bold">
                          {tagline}
                        </h3>
                        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Empty half (stacking layout) */}
                  <div
                    className={`hidden lg:block ${
                      onLeft ? "lg:order-2" : "lg:order-1"
                    }`}
                    aria-hidden="true"
                  />
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}