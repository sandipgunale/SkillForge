import { lazy, Suspense, useRef } from "react";

import { useBorderTrace, useReducedMotion } from "@/lib/motion-gsap";

import { useInView, useSectionEntrance } from "../useEntrance";
import ForgeGraph from "./ForgeGraph";
import { SceneErrorBoundary, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  03 · ENGINE — the knowledge map. A sticky framed panel: the curated       */
/*  ForgeGraph (SVG, precomputed) over an ambient 3D constellation (reused    */
/*  KnowledgeConstellation engine, deferred until near the viewport). Left    */
/*  column sticks in place while the taller section gives the scene air.     */
/* -------------------------------------------------------------------------- */

const KnowledgeConstellation = lazy(() =>
  import("../../components/three/KnowledgeConstellation"),
);

const LEGEND = [
  { swatch: "bg-lp-accent", label: "In progress" },
  { swatch: "bg-lp-secondary", label: "Known" },
  { swatch: "bg-lp-accent-strong", label: "Focus" },
];

export default function EngineSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  useSectionEntrance(rootRef, { identity: "machine", variant: "activate" });

  const panelRef = useRef(null);
  const near = useInView(panelRef);
  useBorderTrace(panelRef);

  return (
    <section
      ref={rootRef}
      id="engine"
      data-landing-section="engine"
      data-motion="machine"
      className="relative bg-lp-bg"
    >
      <div className="lp-container">
        <div className="grid gap-10 py-[clamp(56px,9vw,120px)] lg:min-h-[150svh] lg:grid-cols-[1fr_1.12fr] lg:gap-16">
          {/* Left — sticky statement */}
          <div className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start lg:pt-10">
            <p data-entrance="label" className={T.label}>
              <span className="text-lp-faint">03</span> — The engine
            </p>
            <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[14ch]`}>
              Your knowledge,
              <br />
              <span className="text-lp-accent">mapped as it grows.</span>
            </h2>
            <p data-entrance="lead" className={`${T.body} mt-7 max-w-[44ch]`}>
              Every resource you study, every quiz you pass, every path you
              walk — the forge records it. The map below is a snapshot: your
              real map grows with your progress.
            </p>
            <div data-entrance="content" className="mt-9 flex flex-wrap gap-2.5">
              {["Curated topics", "Progress-aware", "Workspace map"].map((chip) => (
                <span key={chip} className={T.chip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Right — sticky graph panel with ambient constellation behind */}
          <div ref={panelRef} className="relative lg:sticky lg:top-16 lg:self-start">
            {near && !reduced ? (
              <div aria-hidden="true" className="pointer-events-none absolute -inset-6 opacity-70">
                <SceneErrorBoundary>
                  <Suspense fallback={null}>
                    <KnowledgeConstellation className="h-full w-full" />
                  </Suspense>
                </SceneErrorBoundary>
              </div>
            ) : null}
            <div data-entrance="aside" className="lp-panel relative z-10 p-6 sm:p-8 lg:p-10">
              <svg
                data-border-trace
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                width="100%"
                height="100%"
                fill="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="14"
                  vectorEffect="non-scaling-stroke"
                  stroke="var(--lp-accent)"
                  strokeWidth="1.5"
                />
              </svg>
              <div className="flex items-center justify-between gap-4">
                <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em] text-lp-muted">
                  Knowledge map
                </p>
                <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.16em] text-lp-faint">
                  Sample UI — live data at runtime
                </p>
              </div>
              <div className="mt-6">
                <ForgeGraph />
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-lp-border pt-5">
                {LEGEND.map((item) => (
                  <span key={item.label} className="flex items-center gap-2.5">
                    <span className={`size-2 rounded-full ${item.swatch}`} />
                    <span className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] text-lp-muted">
                      {item.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}