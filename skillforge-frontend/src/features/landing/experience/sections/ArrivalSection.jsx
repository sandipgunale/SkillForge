import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

import useDeferredScene from "../useDeferredScene";
import CapEmblem from "../cap/CapEmblem";
import { SceneErrorBoundary, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  00 · ARRIVAL — the hero. Statement-first, copper "forged." on iron.      */
/*  The graduation cap sits right (desktop) / centered behind (mobile). As    */
/*  the hero gives way the cap recedes — scroll-scrubbed, the user owns it.   */
/*  Deferred: the 3D scene mounts only after first paint + idle (FCP budget)  */
/*  and falls back to the SVG emblem when WebGL is unavailable.               */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("../cap/GraduationCapScene"));

const FACTS = ["Curated resources", "AI-graded quizzes", "Adaptive paths"];

export default function ArrivalSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const sceneReady = useDeferredScene();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(select("[data-hero='label']"), { opacity: 0, y: 16, duration: 0.55 }, 0)
        .from(select("[data-hero='title']"), { opacity: 0, y: 28, duration: 0.7 }, 0.08)
        .from(select("[data-hero='subtitle']"), { opacity: 0, y: 24, duration: 0.7 }, 0.18)
        .from(select("[data-hero='cta']"), { opacity: 0, y: 20, duration: 0.6 }, 0.28)
        .from(select("[data-hero='facts']"), { opacity: 0, y: 16, duration: 0.6 }, 0.38)
        .from(select("[data-hero='scroll']"), { opacity: 0, duration: 0.6 }, 1);

      /* Cap recede — as the hero scrolls out, the cap scales down, sinks,
         and fades; the copy drifts up at the same pace. One authored exit. */
      const capWrap = select("[data-cap-slot] > div");
      if (capWrap.length) {
        gsap.fromTo(
          capWrap,
          { scale: 1, opacity: 1, yPercent: 0 },
          {
            scale: 0.92,
            opacity: 0.45,
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "bottom 45%",
              scrub: 0.4,
            },
          },
        );
      }
      const copyWrap = select("[data-hero-copy]");
      if (copyWrap.length) {
        gsap.fromTo(
          copyWrap,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -8,
            opacity: 0.88,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "bottom 45%",
              scrub: 0.4,
            },
          },
        );
      }
      return undefined;
    },
    [reduced],
    rootRef,
  );

  const cap = (
    <div className="aspect-square h-full w-full">
      {sceneReady ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <GraduationCapScene className="h-full w-full" />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <CapEmblem className="h-full w-full opacity-80" />
      )}
    </div>
  );

  return (
    <section
      ref={rootRef}
      id="top"
      data-landing-section="top"
      className="relative overflow-hidden"
    >
      {/* The cap — decorative, never blocks input. Desktop: anchored right,
          below the statement. Mobile: centered behind the copy. */}
      <div
        data-cap-slot
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[62svh] z-0 lg:top-[16svh]"
      >
        <div className="aspect-square w-[104svw] sm:w-[86vw] lg:w-[52vw] xl:w-[58vw]">
          {cap}
        </div>
      </div>

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center lg:items-start lg:px-16 lg:text-left">
        <div data-hero-copy className="w-full max-w-[1180px]">
          <div className="flex justify-center lg:justify-start">
            <p data-hero="label" className={T.label}>
              <span className="text-lp-faint">00</span> — Arrival
            </p>
          </div>
          <h1
            data-hero="title"
            className="font-lp-display mx-auto mt-6 max-w-[14ch] text-[clamp(3rem,8vw,5.75rem)] font-black leading-[0.98] tracking-[-0.025em] lg:mx-0"
          >
            Learning,
            <br />
            <span className="text-lp-accent">forged.</span>
          </h1>
          <p
            data-hero="subtitle"
            className={`${T.body} mx-auto mt-7 max-w-[46ch] text-[clamp(1.0625rem,2vw,1.25rem)] lg:mx-0`}
          >
            SkillForge runs your skill acquisition like a foundry: curated
            resources, AI-graded practice, and learning paths forged around
            how you actually learn.
          </p>
          <div
            data-hero="cta"
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button asChild size="lg" className={T.ctaPrimary}>
              <Link to={ROUTES.REGISTER}>Start forging</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={T.ctaOutline}>
              <a href="#engine">See the engine</a>
            </Button>
          </div>
          <div
            data-hero="facts"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start"
          >
            {FACTS.map((fact) => (
              <span
                key={fact}
                className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em] text-lp-muted"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>

        <a
          data-hero="scroll"
          href="#problem"
          aria-label="Scroll to learn more"
          className="absolute bottom-6 right-8 hidden flex-col items-center gap-2 text-lp-muted transition-colors hover:text-lp-accent md:flex"
        >
          <span className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em]">
            Scroll
          </span>
          <span className="flex h-9 w-6 items-start justify-center rounded-full border border-lp-border-strong p-1.5">
            <span className="size-1.5 animate-scroll-dot rounded-full bg-lp-accent" />
          </span>
        </a>
      </div>
    </section>
  );
}