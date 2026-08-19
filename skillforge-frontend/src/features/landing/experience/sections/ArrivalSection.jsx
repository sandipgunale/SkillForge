import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  GSAP_EASE,
  useMotionScope,
  useReducedMotion,
} from "@/lib/motion-gsap";

import useDeferredScene from "../useDeferredScene";
import CapEmblem from "../cap/CapEmblem";
import { SceneErrorBoundary, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  00 · ARRIVAL — the hero. Statement-first, copper "forged." on iron.      */
/*  The graduation cap sits right (desktop) / centered behind (mobile). As    */
/*  the hero gives way the cap recedes — scroll-scrubbed, the user owns it.   */
/*  Deferred: the 3D scene mounts only after first paint + idle (FCP budget)  */
/*  and falls back to the SVG emblem when WebGL is unavailable.               */
/*                                                                           */
/*  Entrance — "the forge is waking up": one beat sequence with deterministic */
/*  from-states (direct style writes, no clearProps — the P1-1 lesson). The   */
/*  cap itself appears when the deferred scene mounts (B1); the halo opens    */
/*  on clock time (B2) and copy beats follow (B3–B8); an ember pulse closes   */
/*  the sequence (coda). Reduced motion: single opacity cross-fade, no        */
/*  travel, no pre-hiding of children.                                        */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("../cap/GraduationCapScene"));

const FACTS = ["Curated resources", "AI-graded quizzes", "Adaptive paths"];

const BEATS = {
  halo: 0.1,
  label: 0.25,
  title: 0.4,
  subtitle: 0.5,
  cta: 0.6,
  facts: 0.75,
  scroll: 1.0,
  coda: 1.2,
};

export default function ArrivalSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const sceneReady = useDeferredScene();

  useMotionScope(
    ({ gsap, select }) => {
      const reset = (els) =>
        els.forEach((el) => {
          el.style.opacity = "";
          el.style.transform = "";
        });

      /* Reduced motion: a single opacity cross-fade of the statement at
         600ms. Nothing else moves; children are never pre-hidden. */
      if (reduced) {
        const copy = select("[data-hero-copy]");
        if (copy.length) {
          copy.forEach((el) => {
            el.style.opacity = "0";
          });
          gsap.to(copy, { opacity: 1, duration: 0.6, delay: 0.6, ease: GSAP_EASE.scene });
        }
        return undefined;
      }

      /* Deterministic from-states via direct style writes (matching the
         fromTo start values below) so the hero is simply hidden until each
         beat plays it in. Direct writes, not gsap.set: the fromTo tweens
         kill pre-existing gsap.set tweens, and no clearProps anywhere. */
      const preHide = (els, styles) =>
        els.forEach((el) => {
          Object.entries(styles).forEach(([prop, value]) => {
            el.style[prop] = value;
          });
        });
      preHide(select("[data-hero='label']"), { opacity: "0", transform: "translateY(16px)" });
      preHide(select("[data-hero='title']"), { opacity: "0", transform: "translateY(28px)" });
      preHide(select("[data-hero='subtitle']"), { opacity: "0", transform: "translateY(24px)" });
      preHide(select("[data-hero='cta']"), {
        opacity: "0",
        transform: "translateY(20px) scale(0.96)",
      });
      preHide(select("[data-hero='facts']"), { opacity: "0", transform: "translateY(16px)" });
      preHide(select("[data-hero='scroll']"), { opacity: "0" });
      preHide(select("[data-cap-halo]"), { opacity: "0.2" });

      const tl = gsap.timeline({ defaults: { ease: GSAP_EASE.scene } });

      tl.fromTo(
        select("[data-cap-halo]"),
        { opacity: 0.2 },
        { opacity: 0.6, duration: 1.2 },
        BEATS.halo,
      )
        .fromTo(
          select("[data-hero='label']"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55 },
          BEATS.label,
        )
        .fromTo(
          select("[data-hero='title']"),
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7 },
          BEATS.title,
        )
        .fromTo(
          select("[data-hero='subtitle']"),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7 },
          BEATS.subtitle,
        )
        .fromTo(
          select("[data-hero='cta']"),
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: GSAP_EASE.physical },
          BEATS.cta,
        )
        .fromTo(
          select("[data-hero='facts']"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          BEATS.facts,
        )
        .fromTo(
          select("[data-hero='scroll']"),
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          BEATS.scroll,
        )
        .fromTo(
          select("[data-cap-halo]"),
          { opacity: 0.6 },
          { opacity: 0.9, duration: 0.25, ease: GSAP_EASE.micro },
          BEATS.coda,
        )
        .to(select("[data-cap-halo]"), { opacity: 0.6, duration: 0.9 }, BEATS.coda + 0.25);

      /* Live prefers-reduced-motion toggle (T-ADD-4 pattern): if the user
         switches to reduce mid-flight, kill the sequence and restore the
         natural (visible) state immediately. */
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onMediaChange = (e) => {
        if (!e.matches) return;
        tl.kill();
        reset([
          ...select("[data-hero='label']"),
          ...select("[data-hero='title']"),
          ...select("[data-hero='subtitle']"),
          ...select("[data-hero='cta']"),
          ...select("[data-hero='facts']"),
          ...select("[data-hero='scroll']"),
          ...select("[data-cap-halo]"),
        ]);
      };
      media.addEventListener("change", onMediaChange);
      return () => media.removeEventListener("change", onMediaChange);
    },
    [reduced],
    rootRef,
  );

  /* Phase 1 — cap recede: as the hero scrolls out, the cap scales down,
     sinks, and fades; the copy drifts up at the same pace. One authored
     exit, scrubbed so the user owns it. (Reduced motion: static.) */
  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;
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

  /* B1 — the cap wakes when the deferred scene mounts: a quiet fade-in (the
     scene starts at rest via entrance="idle"; the beat timeline never races
     the lazy chunk). The SVG emblem fallback stays visible untouched. */
  useMotionScope(
    ({ gsap, select }) => {
      const scene = select("[data-cap-scene]");
      if (!scene.length) return undefined;
      gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: GSAP_EASE.scene });
      return undefined;
    },
    [sceneReady],
    rootRef,
  );

  const cap = (
    <div className="aspect-square h-full w-full">
      {sceneReady ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <div data-cap-scene style={{ opacity: 0 }} className="h-full w-full">
              <GraduationCapScene entrance="idle" className="h-full w-full" />
            </div>
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
      data-motion="wake"
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
          {/* Ember halo behind the cap — B2 opens it, the coda pulses it.
              No Tailwind transforms here: the beat tweens own transform. */}
          <div
            data-cap-halo
            className="absolute top-[8%] left-[8%] h-[84%] w-[84%] rounded-full bg-lp-accent/20 blur-3xl"
          />
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