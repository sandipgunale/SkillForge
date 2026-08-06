import { motion } from "framer-motion";
import { MonitorPlay, MousePointerClick, TimerOff } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";

const PROBLEMS = [
  {
    icon: MonitorPlay,
    title: "The biggest classroom ever",
    body: "YouTube is where the world learns. But every video ends with a recommendation that isn't yours — and five minutes later you're somewhere else entirely.",
  },
  {
    icon: MousePointerClick,
    title: "Learning is fragmented",
    body: "A tutorial here, a blog post there, a doc that's outdated. No structure, no sequence, no idea where the next step actually is.",
  },
  {
    icon: TimerOff,
    title: "Completion is the exception",
    body: "Most learners abandon courses before finishing. Without feedback and visible progress, momentum dies and so does motivation.",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="The problem"
          title="The internet is the world's best classroom. It's also the world's most distracting one."
          description="Great teachers are everywhere. Great learning environments are not. The raw material for mastering any skill exists — what's missing is a workspace built around finishing."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="card-hover rounded-3xl border bg-card p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
