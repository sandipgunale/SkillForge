import { motion } from "framer-motion";
import { FileSearch, ShieldCheck, SlidersHorizontal } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/motion";

const AI_POINTS = [
  {
    icon: SlidersHorizontal,
    title: "You set the parameters",
    body: "Topic, difficulty, question types (MCQ, coding, interview, scenario), and count — the model generates to your spec.",
  },
  {
    icon: FileSearch,
    title: "Schema-validated output",
    body: "Every response is parsed and re-requested until it meets a strict JSON contract. No malformed quizzes, no dead questions.",
  },
  {
    icon: ShieldCheck,
    title: "Cost-aware guardrails",
    body: "Per-user daily question quotas and automatic model failover keep the AI dependable — and your bill predictable.",
  },
];

export default function AISection() {
  return (
    <section id="ai" className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_80%_50%,color-mix(in_oklch,var(--aurora)_9%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-screen-2xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeading
            align="left"
            eyebrow="AI, in service of focus"
            title="Practice that adapts to you — not another feed."
            description="SkillForge uses Gemini to generate quizzes and evaluate your answers in context. You bring the curiosity; the model brings instant, personalized feedback."
          />

          <div className="mt-10 space-y-5">
            {AI_POINTS.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex gap-4 rounded-2xl border bg-card p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-aurora/12 text-aurora">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quiz evaluation mock */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="glass rounded-3xl border p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                AI evaluation · Binary Search
              </p>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                Correct
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              "Explain the worst-case time complexity of binary search."
            </p>

            <div className="mt-4 rounded-2xl bg-accent/70 p-4">
              <p className="text-sm">
                O(log n) — each comparison halves the search space.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] rounded-full bg-success" />
              </div>
              <p className="text-xs text-muted-foreground">
                Your answer hit the key insight. Next time, mention the
                halving step explicitly for a perfect score.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Correct", "Precision", "Depth"].map((label, i) => (
                <div key={label} className="rounded-xl border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-ember">{["92%", "88%", "95%"][i]}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute -right-6 -top-6 -z-10 h-40 w-40 rounded-full bg-aurora/20 blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
