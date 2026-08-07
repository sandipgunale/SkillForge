import { useRef } from "react";
import { CircleDot, Flame, Hammer, RefreshCw } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  HowItWorksSection — Story 3: the forge loop.                               */
/*  Focus -> Practice -> Feedback -> Momentum, told as a timeline with a       */
/*  connecting ember rail. GSAP scroll reveal; reduced-motion safe.            */
/* -------------------------------------------------------------------------- */

const LOOP = [
  {
    icon: CircleDot,
    step: "01",
    title: "Focus",
    tagline: "The path is set — distractions fall away.",
    body: "A structured path built from the best existing resources: sequenced, filtered, and stripped of every distraction.",
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

export default function HowItWorksSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-how='heading']"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
      });
      gsap.from(select("[data-how='step']"), {
        opacity: 0,
        y: 30,
        duration: 0.65,
        stagger: 0.16,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="how-it-works" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,color-mix(in_oklch,var(--ember)_7%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div data-how="heading" className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="How it works"
            title="The forge loop"
            description="People don't fail because they lack material — they fail because they lose the loop. Focus → Practice → Feedback → Momentum. Repeat."
          />
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="absolute left-7 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-ember/40 via-ember/20 to-transparent lg:left-1/2"
          />

          <ol className="space-y-12 lg:space-y-0">
            {LOOP.map(({ icon: Icon, step, title, tagline, body }, index) => {
              const onLeft = index % 2 === 0;
              return (
                <li
                  key={step}
                  data-how="step"
                  className="relative lg:grid lg:grid-cols-2 lg:gap-24"
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-7 top-2 z-10 size-3 -translate-x-1/2 rounded-full bg-ember shadow-[0_0_0_5px_color-mix(in_oklch,var(--ember)_18%,transparent)] lg:left-1/2 lg:top-6"
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
                          {step} — {title}
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

                  <div
                    aria-hidden="true"
                    className={`hidden lg:block ${
                      onLeft ? "lg:order-2" : "lg:order-1"
                    }`}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}