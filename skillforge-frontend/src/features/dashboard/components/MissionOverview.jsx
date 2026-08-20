import { lazy, Suspense, useRef } from "react";
import { Award, BrainCircuit, Clock3, Sparkles, TrendingUp } from "lucide-react";

import AIOrb from "./AIOrb";
import CountUp from "@/components/common/CountUp";
import LogoMark from "@/components/common/LogoMark";
import { Progress } from "@/components/ui/progress";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";
import { formatStudyTime } from "@/lib/format";

const ForgeSignature = lazy(() => import("@/features/landing/experience/cap/ForgeSignature"));

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight forge";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function levelTitle(level) {
  return level && level !== "Learner" ? `${level} Learner` : "Learner";
}

function quip(progress) {
  if (progress >= 80) return "Exceptional health. Keep the ember lit.";
  if (progress >= 50) return "Building real momentum. Stay in the loop.";
  if (progress >= 25) return "The forge is warming up. Consistency compounds.";
  return "Every session lights a new ember. Start with one quiz.";
}

/* The Knowledge Forge signature (P4) as a live progress ornament: health maps
   to the journey phases the learner is in (T-ENG-5 — app state driver). */
function signaturePhase(progress) {
  if (progress >= 75) return "mastered";
  if (progress >= 50) return "personalized";
  if (progress >= 25) return "structured";
  return "fragmented";
}

export default function MissionOverview({ analytics }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const progress = analytics.learningHealthScore ?? 0;

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-overview]"), {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl shadow-xl"
      aria-label="Mission overview"
    >
      {/* Mission deck — deep ink field with ember + aurora energy (tokens) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--ember)_32%,var(--background))_0%,color-mix(in_oklch,var(--ember)_68%,var(--background))_35%,color-mix(in_oklch,var(--aurora)_62%,var(--background))_70%,color-mix(in_oklch,var(--aurora)_38%,var(--background))_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_85%_110%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_60%)]"
      />

      {/* Ember glow orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 size-64 rounded-full bg-ember/25 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 size-72 rounded-full bg-aurora/20 blur-3xl" />
      </div>

      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-12">
        <div className="space-y-7">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3.5 text-ember" aria-hidden="true" />
              {greeting()}
            </p>

            <h1 className="display mt-3 text-4xl font-bold sm:text-5xl">
              {levelTitle(analytics.learningLevel)}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {quip(progress)}
            </p>
          </div>

          <div className="max-w-sm space-y-2.5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <LogoMark className="size-4" />
                Learning Health
              </span>
              <span className="font-semibold text-foreground">
                <CountUp to={progress} suffix="/100" />
              </span>
            </div>
            <Progress
              value={progress}
              indicatorClassName="bg-warning"
              className="h-2.5 bg-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            <Metric icon={Award} label="Health">
              <CountUp to={progress} suffix="/100" />
            </Metric>
            <Metric icon={BrainCircuit} label="Average">
              <CountUp to={analytics.overallAverageScore ?? 0} suffix="%" />
            </Metric>
            <Metric icon={Clock3} label="Study Time">
              {formatStudyTime(analytics.totalLearningMinutes)}
            </Metric>
            <Metric icon={TrendingUp} label="Top Topic">
              {analytics.mostActiveTopic}
            </Metric>
          </div>
        </div>

        {/* AI Orb — the living health core */}
        <div data-overview className="hidden justify-center lg:flex">
          <div className="relative size-72">
            <AIOrb health={progress} className="absolute inset-0" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-extrabold tracking-tight text-foreground">
                <CountUp to={progress} />
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                health
              </p>
            </div>

            <Suspense fallback={null}>
              <div className="pointer-events-none absolute bottom-1 left-1/2 size-14 -translate-x-1/2 opacity-80">
                <ForgeSignature phase={signaturePhase(progress)} />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, children }) {
  return (
    <div
      data-overview
      className="glass group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ember/40"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">
        {children}
      </div>
    </div>
  );
}