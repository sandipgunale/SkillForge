import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useMotionScope, usePressPhysics, useReducedMotion } from "@/lib/motion-gsap";

import { useInView } from "../useEntrance";
import CapEmblem from "../cap/CapEmblem";
import { SceneErrorBoundary, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  13 · MASTERY — the finale. A tall section holds a sticky stage; the cap  */
/*  returns from below and settles while the closing statement lands. One     */
/*  scrub, no pinning library — native sticky, GSAP scrub.                    */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("../cap/GraduationCapScene"));
const ForgeSignature = lazy(() => import("../cap/ForgeSignature"));

export default function MasterySection() {
  const rootRef = useRef(null);
  const ctaRef = useRef(null);
  const ctaOutlineRef = useRef(null);
  const signatureRef = useRef(null);
  const reduced = useReducedMotion();
  const sceneReady = useInView(rootRef);

  usePressPhysics(ctaRef);
  usePressPhysics(ctaOutlineRef);

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;
      const cap = select("[data-cap-return]");
      const scene = select("[data-cap-scene-wrap]");
      const sig = select("[data-signature-wrap]");
      const copy = select("[data-mastery-copy]");
      const proxy = { p: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
        defaults: { ease: "none" },
      });
      if (cap.length) {
        /* Act 1 — cap phases 2-3 (rotate + depth): the cap returns from below
           with a slight counter-rotation that settles straight, while the scale
           draws it closer. Hosted on the Mastery sticky stage — the hero cap
           has already receded out of the story. */
        tl.fromTo(
          cap,
          { yPercent: 34, opacity: 0, scale: 0.9, rotation: -5 },
          { yPercent: 0, opacity: 1, scale: 1, rotation: 0 },
          0,
        );
      }
      if (copy.length) {
        /* autoAlpha keeps the invisible copy (and its CTAs) out of the
           pointer tab order until the scrub reveals it. */
        tl.fromTo(copy, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.18);
      }
      if (scene.length && sig.length) {
        /* Act 2 — the Knowledge Forge signature (F4, decision #25): two
           distinct acts, not a replay. The cap scene dissolves (0.55-0.75)
           as the signature's fragment field enters; the field then converges
           into the cap silhouette (0.75-1.0), fragmented -> structured ->
           personalized -> mastered, driven through the imperative handle. */
        tl.to(scene, { opacity: 0, scale: 1.06, duration: 0.2, ease: "power1.in" }, 0.55);
        tl.fromTo(sig, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.55);
        tl.to(
          proxy,
          {
            p: 1,
            duration: 0.25,
            onUpdate: () => signatureRef.current?.setProgress(proxy.p),
          },
          0.75,
        );
      }
      return undefined;
    },
    [reduced, sceneReady],
    rootRef,
  );

  const cap = sceneReady ? (
    <SceneErrorBoundary>
      <Suspense fallback={<CapEmblem className="h-full w-full opacity-90" />}>
        <GraduationCapScene className="h-full w-full" />
      </Suspense>
    </SceneErrorBoundary>
  ) : (
    <CapEmblem className="h-full w-full opacity-90" />
  );

  const signature = sceneReady ? (
    <SceneErrorBoundary>
      <Suspense fallback={<CapEmblem className="h-full w-full opacity-90" />}>
        <ForgeSignature ref={signatureRef} progress={0} />
      </Suspense>
    </SceneErrorBoundary>
  ) : (
    <CapEmblem className="h-full w-full opacity-90" />
  );

  return (
    <section
      ref={rootRef}
      id="mastery"
      data-landing-section="mastery"
      data-motion="transformation"
      className="relative min-h-[140svh] bg-lp-bg"
    >
      <div className="sticky top-0 flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div
          data-cap-return
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 w-[82svh] -translate-x-1/2 -translate-y-1/2 sm:w-[62svw] lg:w-[44svw]"
        >
          <div className="relative aspect-square">
            <div data-cap-scene-wrap className="absolute inset-0">{cap}</div>
            <div data-signature-wrap className="absolute inset-0 opacity-0">{signature}</div>
          </div>
        </div>

        <div data-mastery-copy className="relative z-10 mx-auto max-w-[1180px]">
          <p className={T.label}>
            <span className="text-lp-faint">13</span> — Mastery
          </p>
          <h2 className="font-lp-display mx-auto mt-6 max-w-[12ch] text-[clamp(2.6rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.025em]">
            The cap <span className="text-lp-accent">returns.</span>
          </h2>
          <p className={`${T.body} mx-auto mt-6 max-w-[46ch] text-[clamp(1rem,1.8vw,1.1875rem)]`}>
            Everything the forge does — the paths, the practice, the honest
            feedback — exists to close the loop between where you are and
            where you're headed. Forge what's next.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild ref={ctaRef} size="lg" className={T.ctaPrimary}>
              <Link to={ROUTES.REGISTER}>Start forging</Link>
            </Button>
            <Button asChild ref={ctaOutlineRef} size="lg" variant="outline" className={T.ctaOutline}>
              <Link to={ROUTES.DASHBOARD}>Open the dashboard</Link>
            </Button>
          </div>
          <p className="font-lp-mono mt-10 text-[0.6875rem] uppercase tracking-[0.24em] text-lp-muted">
            What you forge, you keep.
          </p>
        </div>
      </div>
    </section>
  );
}