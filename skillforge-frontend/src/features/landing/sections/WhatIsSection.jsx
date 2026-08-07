import { useRef } from "react";
import { CheckCircle2, Flame, LayoutDashboard, LineChart, MonitorPlay, MousePointerClick, TimerOff } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  WhatIsSection — Story 2: what the forge actually is.                       */
/*  The raw-material problem on the left; the single focused workspace that    */
/*  solves it on the right, shown as a live dashboard mock.                    */
/*  GSAP scroll reveal; reduced-motion safe.                                   */
/* -------------------------------------------------------------------------- */

const PROBLEMS = [
  {
    icon: MonitorPlay,
    title: "The biggest classroom ever",
    body: "YouTube is where the world learns. Every video ends with a recommendation that isn't yours — and five minutes later you're somewhere else.",
  },
  {
    icon: MousePointerClick,
    title: "Learning is fragmented",
    body: "A tutorial here, a blog post there, an outdated doc. No structure, no sequence, no idea where the next step actually is.",
  },
  {
    icon: TimerOff,
    title: "Completion is the exception",
    body: "Without feedback and visible progress, momentum dies. Most learners abandon long before the finish line.",
  },
];

const PREVIEW_FEATURES = [
  "One focused workspace, zero tab soup",
  "Paths, quizzes, health score — in one place",
  "Progress that proves itself",
];

const BAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const BAR_HEIGHTS = [34, 58, 42, 76, 52, 88, 66];

function DashboardMock() {
  return (
    <div className="elevate-float relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border bg-card">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
        <span className="size-3 rounded-full bg-rose-400/70" />
        <span className="size-3 rounded-full bg-amber-400/70" />
        <span className="size-3 rounded-full bg-emerald-400/70" />
        <div className="mx-auto flex items-center gap-1.5 rounded-full bg-muted/70 px-4 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          app.skillforge.io/dashboard
        </div>
      </div>

      <div className="grid md:grid-cols-[11rem_1fr]">
        <div className="hidden border-r bg-muted/25 p-4 md:block">
          <div className="flex items-center gap-2 px-1">
            <span className="flex size-7 items-center justify-center rounded-lg bg-ember text-white">
              <Flame className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">SkillForge</span>
          </div>
          <nav className="mt-6 space-y-1.5">
            {["Dashboard", "Analytics", "Quizzes", "Paths"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                  i === 0
                    ? "bg-ember/12 font-semibold text-ember"
                    : "text-muted-foreground"
                }`}
              >
                {i === 0 && <LayoutDashboard className="size-3.5" />}
                {i === 1 && <LineChart className="size-3.5" />}
                <span>{item}</span>
              </div>
            ))}
          </nav>
          <div className="mt-8 rounded-xl border bg-card p-3">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground">
              Learning health
            </p>
            <p className="mt-1 text-xl font-bold text-ember">82</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-ember to-aurora" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">This week</p>
            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-2xs font-semibold text-success">
              +12% momentum
            </span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={`${i}-${BAR_DAYS[i]}`} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-md ${
                    i === 5
                      ? "bg-gradient-to-t from-ember to-aurora"
                      : "bg-muted-foreground/25"
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-3xs text-muted-foreground">{BAR_DAYS[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {PREVIEW_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-ember" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatIsSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-what='heading']"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
      });
      gsap.from(select("[data-what='problem']"), {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 74%", once: true },
      });
      gsap.from(select("[data-what='mock']"), {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="what-is" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_85%_20%,color-mix(in_oklch,var(--aurora)_8%,transparent)_0%,transparent_60%),radial-gradient(ellipse_40%_40%_at_10%_70%,color-mix(in_oklch,var(--ember)_6%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div data-what="heading" className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="What it is"
            title="The internet is the world's best classroom. It's also the most distracting one."
            description="Great teachers are everywhere. Great learning environments are not. The raw material for any skill exists — what's missing is a workspace built around finishing."
          />
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5">
            {PROBLEMS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                data-what="problem"
                className="flex gap-4 rounded-2xl border bg-card p-5 transition-colors duration-300 hover:border-ember/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div data-what="mock">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}