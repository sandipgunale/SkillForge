import { useRef } from "react";
import { BookOpen, Library, Quote, ShieldCheck } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  ExperienceSection — Story 7: who the forge serves.                         */
/*  Learner voices as proof, then the three roles that share the workspace.    */
/*  GSAP scroll reveal; reduced-motion safe.                                   */
/* -------------------------------------------------------------------------- */

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

export default function ExperienceSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-xp='heading']"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
      });
      gsap.from(select("[data-xp='voice']"), {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 74%", once: true },
      });
      gsap.from(select("[data-xp='role']"), {
        opacity: 0,
        y: 26,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="experience" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_30%,color-mix(in_oklch,var(--ember)_6%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div data-xp="heading" className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Proof"
            title="What happens when learners keep the loop"
          />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, title, initials }) => (
            <figure
              key={name}
              data-xp="voice"
              className="flex flex-col rounded-3xl border bg-card p-7 transition-colors duration-300 hover:border-ember/40"
            >
              <Quote className="size-6 text-ember" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                {quote}
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
            </figure>
          ))}
        </div>

        <div data-xp="heading" className="mx-auto mt-20 max-w-2xl">
          <SectionHeading
            eyebrow="One platform, three roles"
            title="Everyone who touches learning gets a workspace"
            description="Learners stay in flow. Instructors publish with purpose. Administrators keep everything healthy. Each role sees exactly what it needs — nothing more."
          />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ROLES.map(({ icon: Icon, role, headline, points, accent }) => (
            <div
              key={role}
              data-xp="role"
              className="card-hover flex flex-col rounded-3xl border bg-card p-8 transition-colors duration-300 hover:border-ember/40"
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
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}