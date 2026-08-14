import { lazy, Suspense, useCallback, useLayoutEffect, useRef } from "react";

import CapEmblem from "./cap/CapEmblem";
import useDeferredScene from "./useDeferredScene";
import { useReducedMotion } from "@/lib/motion-gsap";

import Cursor from "../components/Cursor";
import ScrollProgress from "../components/ScrollProgress";
import LandingFooter from "../components/LandingFooter";

import ForgePage from "./forge/ForgePage";
import useForgeFold from "./forge/useForgeFold";
import { ANCHORS, SECTIONS } from "./forge/registry";
import { measureSlots, publishSlots } from "./forge/geometry";
import StaticSections from "./forge/StaticSections";

import "./forge/forge.css";

/* -------------------------------------------------------------------------- */
/*  LandingExperience — the landing as a normal full-screen website with      */
/*  one physical transition: the section itself folds away around its right   */
/*  edge as the next section scrolls up underneath it.                        */
/*                                                                             */
/*  Nine full-width, min-height 100svh sections live in one measured stage    */
/*  (height = sum of the sections' own heights). The Forge Fold controller    */
/*  (useForgeFold) pins each page to its scroll window and rotates it around  */
/*  its right edge (rotateY 0 -> -180) — the next page is already underneath. */
/*  z-index is deterministic (earlier pages above later); the rotating page   */
/*  is lifted toward the viewer by translateZ — depth comes from perspective  */
/*  and shadow, never margins, so there is no layout gap.                     */
/*                                                                             */
/*  The giant graduation cap lives ONLY in the hero section (a decorative,    */
/*  pointer-events-none backdrop behind the copy) and folds away with it.     */
/*  Under prefers-reduced-motion the stage never mounts — StaticSections      */
/*  renders the same sections in normal flow.                                  */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("./cap/GraduationCapScene"));

export default function LandingExperience() {
  const reduced = useReducedMotion();
  const sceneReady = useDeferredScene();

  const stageRef = useRef(null);
  const pagesRef = useRef([]);

  const bindPage = useCallback((index, refs) => {
    if (refs) pagesRef.current[index] = refs;
  }, []);

  useForgeFold({ stageRef, pagesRef, reduced });

  /* Reduced-motion branch: no fold, but the shared slot model still needs a
     publish (mount/resize/fonts) so consumers that cached geometry earlier —
     the navbar's marker tops — detect the change and re-read. */
  const staticRootRef = useRef(null);
  useLayoutEffect(() => {
    if (!reduced) return undefined;
    const root = staticRootRef.current;
    if (!root) return undefined;
    const publish = () => {
      const { slots, total } = measureSlots(root);
      if (slots.length) publishSlots(root, slots, total);
    };
    publish();
    window.addEventListener("resize", publish);
    document.fonts?.ready.then(publish).catch(() => {});
    return () => window.removeEventListener("resize", publish);
  }, [reduced]);

  if (reduced) {
    return (
      <>
        <Cursor />
        <ScrollProgress />
        <div ref={staticRootRef}>
          <StaticSections />
        </div>
        <LandingFooter />
      </>
    );
  }

  const heroCap = (
    <div className="aspect-square h-full w-full">
      {sceneReady ? (
        <Suspense fallback={null}>
          <GraduationCapScene className="h-full w-full" />
        </Suspense>
      ) : (
        <CapEmblem className="h-full w-full opacity-80" />
      )}
    </div>
  );

  return (
    <>
      <Cursor />
      <ScrollProgress />
      <div ref={stageRef} className="forge-fold" data-forge-fold>
        {/* Static anchor markers — see [data-anchor] in forge.css. They must
            precede the pages so native hash navigation resolves to them. */}
        {ANCHORS.map((id) => (
          <div key={`anchor-${id}`} id={id} data-anchor={id} aria-hidden="true" />
        ))}
        {SECTIONS.map(({ Component }, index) => (
          <ForgePage key={index} index={index} zIndex={SECTIONS.length - index} onBind={bindPage}>
            <Component cap={index === 0 ? heroCap : undefined} />
          </ForgePage>
        ))}
      </div>
      {/* The footer lives INSIDE the lazy landing chunk: painted in its final
          position in the same commit as the fold, it can never be pushed down
          when the route mounts — that old shell-frame shift was the page's
          one big CLS event. */}
      <LandingFooter />
    </>
  );
}