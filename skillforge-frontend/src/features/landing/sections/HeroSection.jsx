import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Target, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import CountUp from "@/components/common/CountUp";
import { ROUTES } from "@/constants/routes";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* three.js is heavy — split into its own chunk and load after first paint */
const ForgeCoreScene = lazy(() =>
  import("../components/three/ForgeCoreScene"),
);

const HERO_STATS = [
  { count: 100, suffix: "%", value: "100%", label: "Your attention, protected" },
  { value: "AI", label: "Practice forged for you, on demand" },
  { count: 0, suffix: "", value: "0", label: "Distractions, by design" },
];

export default function HeroSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  // Staged GSAP migration — the hero entrance is now timeline-based, fully
  // reverted on unmount and skipped under prefers-reduced-motion.
  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(select("[data-hero='badge']"), { opacity: 0, y: 16, duration: 0.55 }, 0)
        .from(select("[data-hero='title']"), { opacity: 0, y: 28, duration: 0.7 }, 0.08)
        .from(select("[data-hero='subtitle']"), { opacity: 0, y: 24, duration: 0.7 }, 0.18)
        .from(select("[data-hero='cta']"), { opacity: 0, y: 20, duration: 0.6 }, 0.28)
        .from(select("[data-hero='stats']"), { opacity: 0, y: 20, duration: 0.7 }, 0.45)
        .from(select("[data-hero='scroll']"), { opacity: 0, duration: 0.6 }, 1)
        .from(
          select("[data-hero='floating'] > *"),
          { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.12 },
          0.55,
        )
        .from(
          select("[data-hero='core']"),
          { opacity: 0, scale: 0.92, duration: 0.8 },
          0.1,
        );
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="top" ref={rootRef} className="relative overflow-hidden">
      {/* Ambient layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--ember)_10%,transparent)_0%,transparent_55%)]" />
        <div className="absolute inset-0 animate-aurora bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,color-mix(in_oklch,var(--aurora)_10%,transparent)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      <Suspense fallback={null}>
        <div
          data-hero="core"
          className="absolute inset-0 -z-20 h-full w-full"
        >
          <ForgeCoreScene className="h-full w-full" />
        </div>
      </Suspense>

      <div className="mx-auto flex min-h-[92vh] max-w-screen-2xl flex-col items-center justify-center px-6 py-32 text-center lg:px-10">
        <div
          data-hero="badge"
          className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
        >
          <Flame className="size-4 text-ember" />
          Forged by The Forge — focused, made
        </div>

        <h1
          data-hero="title"
          className="mt-7 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.25rem]"
        >
          The internet is infinite.
          <br />
          <span className="text-gradient-ember">Your focus is forged.</span>
        </h1>

        <p
          data-hero="subtitle"
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          SkillForge hammers scattered videos, articles, and tutorials into one
          structured, distraction-free path — with AI quizzes, instant
          feedback, and momentum that keeps you finishing.
        </p>

        <div
          data-hero="cta"
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link to={ROUTES.REGISTER} className="group">
            <Button
              size="lg"
              className="h-12 w-full rounded-full px-7 text-base shadow-lg shadow-ember/20 transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] sm:w-auto"
            >
              Start learning free
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full px-7 text-base transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] sm:w-auto"
            >
              Explore the dashboard
            </Button>
          </Link>
        </div>

        <dl
          data-hero="stats"
          className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <dt className="text-2xl font-bold text-gradient-ember">
                {stat.count != null ? (
                  <CountUp to={stat.count} suffix={stat.suffix ?? ""} />
                ) : (
                  stat.value
                )}
              </dt>
              <dd className="max-w-[13rem] text-sm text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

        {/* Scroll indicator */}
        <a
          data-hero="scroll"
          href="#what-is"
          aria-label="Scroll to learn more"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground md:flex"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em]">
            Scroll
          </span>
          <span className="flex h-9 w-6 items-start justify-center rounded-full border border-muted-foreground/30 p-1.5">
            <span className="size-1.5 animate-scroll-dot rounded-full bg-current" />
          </span>
        </a>

        {/* Floating achievement cards */}
        <div
          data-hero="floating"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
        >
          <div className="glass absolute right-[8%] top-[22%] animate-float rounded-2xl border p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-ember/15 text-ember">
                <Zap className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Quiz Master</p>
                <p className="text-xs text-muted-foreground">10 quizzes completed</p>
              </div>
            </div>
          </div>

          <div className="glass absolute left-[7%] top-[46%] animate-float rounded-2xl border p-4 shadow-xl [animation-delay:1.4s]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-aurora/15 text-aurora">
                <Target className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Learning health</p>
                <p className="text-xs text-muted-foreground">+12% this week</p>
              </div>
            </div>
          </div>

          <div className="glass absolute bottom-[18%] right-[14%] animate-float rounded-2xl border p-4 shadow-xl [animation-delay:2.2s]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                <Sparkles className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Perfect score</p>
                <p className="text-xs text-muted-foreground">AI evaluation complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}