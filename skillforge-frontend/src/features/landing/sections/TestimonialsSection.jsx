import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staggerContainer, staggerItem } from "@/lib/motion";

const TESTIMONIALS = [
  {
    quote:
      "I'd watched 200 hours of tutorials and finished nothing. SkillForge's path told me what to do next — and the quizzes proved I actually knew it.",
    name: "Ananya Rao",
    title: "Backend developer, self-taught",
    initials: "AR",
  },
  {
    quote:
      "The AI feedback is the difference. Getting a detailed 'why' on every quiz answer feels like having a mentor who always has time.",
    name: "Marcus Chen",
    title: "CS student",
    initials: "MC",
  },
  {
    quote:
      "As an instructor I finally see engagement data. It changed how I structure my material — and my students finish more of it.",
    name: "Elena Vasquez",
    title: "Systems design instructor",
    initials: "EV",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_30%,color-mix(in_oklch,var(--ember)_6%,transparent)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Proof"
          title="What happens when learners keep the loop"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map(({ quote, name, title, initials }) => (
            <motion.figure
              key={name}
              variants={staggerItem}
              className="flex flex-col rounded-3xl border bg-card p-7"
            >
              <Quote className="size-6 text-ember" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                "{quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar className="size-10 border">
                  <AvatarFallback className="bg-ember/15 text-xs font-semibold text-ember">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{title}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
