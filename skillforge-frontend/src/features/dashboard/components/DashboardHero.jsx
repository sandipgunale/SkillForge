import { Award, BrainCircuit, Clock3, Flame, Sparkles, TrendingUp } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import { Progress } from "@/components/ui/progress";

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

function formatStudyTime(minutes) {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const rest = total % 60;

  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function Metric({ icon: Icon, label, value, children }) {
  return (
    <div className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15">
      <div className="flex items-center gap-2 text-white/75">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2.5 text-2xl font-bold tracking-tight text-white">
        {children ?? value}
      </div>
    </div>
  );
}

export default function DashboardHero({ analytics }) {
  const progress = analytics.learningHealthScore ?? 0;

  return (
    <section className="relative overflow-hidden rounded-3xl text-white shadow-xl">
      {/* Animated gradient field (dark-blend, works in both themes) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,#4a1d0e_0%,#b45309_35%,#0e7490_70%,#134e4a_100%)] bg-[length:220%_100%] animate-gradient-shift"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_85%_110%,rgba(255,255,255,0.16),transparent_60%)]"
      />

      {/* Ember glow orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 size-64 rounded-full bg-ember/40 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 size-72 rounded-full bg-aurora/30 blur-3xl" />
      </div>

      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:p-12">
        <div className="space-y-7">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {greeting()}
            </p>

            <h1 className="display mt-3 text-4xl font-bold sm:text-5xl">
              {levelTitle(analytics.learningLevel)}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {quip(progress)}
            </p>
          </div>

          <div className="max-w-sm space-y-2.5">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Flame className="size-4 text-warning" aria-hidden="true" />
                Learning Health
              </span>
              <span className="font-semibold text-white">
                <CountUp to={progress} suffix="/100" />
              </span>
            </div>
            <Progress
              value={progress}
              indicatorClassName="bg-warning"
              className="h-2.5 bg-white/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <Metric icon={Award} label="Health">
            <CountUp to={analytics.learningHealthScore ?? 0} suffix="/100" />
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
    </section>
  );
}