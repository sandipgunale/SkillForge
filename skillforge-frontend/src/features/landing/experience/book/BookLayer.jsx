import { useEffect, useRef } from "react";

import PageBack from "./PageBack";
import { TitlePage, ProblemLeft, ProblemRight } from "./pages/TitleAndProblem";
import { LoopLeft, LoopRight } from "./pages/LoopPages";
import { WorkspaceLeft, MetricsRight } from "./pages/WorkspacePages";
import { AiLeft, BuiltRight } from "./pages/AiPages";
import { RoadmapLeft, MomentumRight } from "./pages/RoadmapPages";
import { MapLeft, RolesRight } from "./pages/KnowledgeAndRoles";
import { FaqLeft, VoicesRight } from "./pages/QuestionsPages";
import { CtaInside } from "./pages/EndPages";

/* -------------------------------------------------------------------------- */
/*  BookLayer — the book itself: sixteen single-page leaves, one visible at   */
/*  a time, hinged on the fixed right-hand spine. Leaf refs are registered    */
/*  with the parent so the single GSAP master timeline can drive every        */
/*  rotation, depth, and hinge shadow. Each leaf carries the page content     */
/*  (front) and a decorative page-back (verso) glimpsed mid-flip.             */
/* -------------------------------------------------------------------------- */

const TOTAL_PAGES = 16;

const REST_Z_BASE = 2;
const REST_Z_STEP = 1.5;

/* Page 1 = title; every chapter opener's verso shows its Roman numeral. */
const LEAVES = [
  { key: "title", Front: TitlePage, frontProps: { number: 1 }, numeral: "I" },
  { key: "problem-open", Front: ProblemLeft, frontProps: { number: 2 }, numeral: "II" },
  { key: "problem-answer", Front: ProblemRight, frontProps: { number: 3 } },
  { key: "loop-open", Front: LoopLeft, frontProps: { number: 4 }, numeral: "III" },
  { key: "loop-continued", Front: LoopRight, frontProps: { number: 5 } },
  { key: "workspace-open", Front: WorkspaceLeft, frontProps: { number: 6 }, numeral: "IV" },
  { key: "metrics", Front: MetricsRight, frontProps: { number: 7 } },
  { key: "ai-open", Front: AiLeft, frontProps: { number: 8 }, numeral: "V" },
  { key: "built", Front: BuiltRight, frontProps: { number: 9 } },
  { key: "roadmap-open", Front: RoadmapLeft, frontProps: { number: 10 }, numeral: "VI" },
  { key: "momentum", Front: MomentumRight, frontProps: { number: 11 } },
  { key: "map", Front: MapLeft, frontProps: { number: 12 }, numeral: "VII" },
  { key: "roles", Front: RolesRight, frontProps: { number: 13 } },
  { key: "faq", Front: FaqLeft, frontProps: { number: 14 }, numeral: "VIII" },
  { key: "voices", Front: VoicesRight, frontProps: { number: 15 } },
  { key: "cta", Front: CtaInside, frontProps: { number: 16 } },
];

export default function BookLayer({ bindLeaves }) {
  const rotations = useRef([]);
  const stacks = useRef([]);
  const shadows = useRef([]);
  const fronts = useRef([]);

  useEffect(() => {
    bindLeaves?.({
      rotations: rotations.current,
      stacks: stacks.current,
      shadows: shadows.current,
      fronts: fronts.current,
    });
  }, [bindLeaves]);

  return (
    <div className="book-clip">
      <div className="book">
        <div className="book-spine" aria-hidden="true" />

        {LEAVES.map((leaf, index) => {
          const { Front, frontProps, numeral, key } = leaf;
          const restZ = REST_Z_BASE + (LEAVES.length - 1 - index) * REST_Z_STEP;
          return (
            <div
              key={key}
              ref={(el) => {
                stacks.current[index] = el;
              }}
              className="book-leaf-stack"
              style={{ transform: `translateZ(${restZ}px)` }}
            >
              <div
                ref={(el) => {
                  shadows.current[index] = el;
                }}
                className="book-leaf-shadow"
              />
              <div
                ref={(el) => {
                  rotations.current[index] = el;
                }}
                className="book-leaf"
              >
                <div
                  ref={(el) => {
                    fronts.current[index] = el;
                  }}
                  className="book-face book-page-surface"
                  style={{ visibility: index === 0 ? "visible" : "hidden" }}
                >
                  <Front {...frontProps} total={TOTAL_PAGES} />
                </div>
                <div className="book-face book-face--back book-page-back-surface" aria-hidden="true">
                  <PageBack number={frontProps.number} numeral={numeral} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
