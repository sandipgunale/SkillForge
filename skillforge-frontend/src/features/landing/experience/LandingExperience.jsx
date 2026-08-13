import { lazy, Suspense, useCallback, useRef } from "react";

import CapEmblem from "./cap/CapEmblem";
import useDeferredScene from "./useDeferredScene";
import { useReducedMotion } from "@/lib/motion-gsap";

import ForgePage from "./forge/ForgePage";
import useForgeFold from "./forge/useForgeFold";
import { ANCHORS, SECTIONS } from "./forge/registry";
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

  if (reduced) {
    return <StaticSections />;
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
  );
}