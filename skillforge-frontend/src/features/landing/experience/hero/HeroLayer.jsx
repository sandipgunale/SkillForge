import { useRef } from "react";
import { Sparkles, Target, Zap } from "lucide-react";

import HeroContent from "../components/HeroContent";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  HeroLayer — the stage's opening scene.                                    */
/*  Sits inside the fixed experience stage. The cap anchor marks where the    */
/*  floating 3D cap lives; on scroll the cap flies from here into the cover   */
/*  emblem. Entrance choreography via GSAP (reduced-motion safe).             */
/* -------------------------------------------------------------------------- */

export default function HeroLayer() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

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
        );
    },
    [reduced],
    rootRef,
  );

  return (
    <section ref={rootRef} id="top" className="relative h-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--ember)_10%,transparent)_0%,transparent_55%)]" />
        <div className="absolute inset-0 animate-aurora bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,color-mix(in_oklch,var(--aurora)_10%,transparent)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 py-24 lg:px-10">
        {/* The floating 3D cap floats above this anchor (desktop stage) */}
        <div
          data-cap-anchor="hero"
          aria-hidden="true"
          className="pointer-events-none relative mb-2 h-36 w-full sm:h-44"
        />

        <HeroContent />

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
          <div className="glass absolute right-[8%] top-[18%] animate-float rounded-2xl border p-4 shadow-xl">
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

          <div className="glass absolute left-[7%] top-[42%] animate-float rounded-2xl border p-4 shadow-xl [animation-delay:1.4s]">
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
