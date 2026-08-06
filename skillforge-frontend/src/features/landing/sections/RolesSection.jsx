import { motion } from "framer-motion";
import { BookOpen, Library, ShieldCheck } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/motion";

const ROLES = [
  {
    icon: BookOpen,
    role: "For learners",
    headline: "Your path, your pace, your proof",
    points: [
      "One focused workspace replacing scattered tabs",
      "AI quizzes after every learning session",
      "Visible progress: health score, mastery, badges",
      "Resume any quiz or path exactly where you left off",
    ],
    accent: "bg-ember/12 text-ember",
  },
  {
    icon: Library,
    role: "For instructors",
    headline: "Publish to the platform, not the void",
    points: [
      "Curate resources that become structured curriculum",
      "Track how learners engage with your content",
      "Quizzes and paths built around your material",
      "Admin-reviewed quality signals for trust",
    ],
    accent: "bg-aurora/12 text-aurora",
  },
  {
    icon: ShieldCheck,
    role: "For administrators",
    headline: "Run the platform with clarity",
    points: [
      "User management: roles, activation, search",
      "Platform-wide statistics at a glance",
      "Topic and tag governance for clean navigation",
      "Every action audited with request tracing",
    ],
    accent: "bg-success/12 text-success",
  },
];

export default function RolesSection() {
  return (
    <section id="roles" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="One platform, three roles"
          title="Everyone who touches learning gets a workspace"
          description="Learners stay in flow. Instructors publish with purpose. Administrators keep everything healthy. Each role sees exactly what it needs — nothing more."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 lg:grid-cols-3"
        >
          {ROLES.map(({ icon: Icon, role, headline, points, accent }) => (
            <motion.div
              key={role}
              variants={staggerItem}
              className="card-hover flex flex-col rounded-3xl border bg-card p-8"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${accent}`}
              >
                <Icon className="size-6" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {role}
              </p>
              <h3 className="mt-2 text-xl font-bold">{headline}</h3>
              <ul className="mt-5 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
