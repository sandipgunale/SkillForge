import { useEffect, useRef } from "react";

import CoverPage from "./CoverPage";
import { TitlePage, ProblemLeft, ProblemRight } from "./pages/TitleAndProblem";
import { LoopLeft, LoopRight } from "./pages/LoopPages";
import { WorkspaceLeft, MetricsRight } from "./pages/WorkspacePages";
import { AiLeft, BuiltRight } from "./pages/AiPages";
import { RoadmapLeft, MomentumRight } from "./pages/RoadmapPages";
import { MapLeft, RolesRight } from "./pages/KnowledgeAndRoles";
import { FaqLeft, VoicesRight } from "./pages/QuestionsPages";
import { CtaInside, BackCoverOutside } from "./pages/EndPages";

/* -------------------------------------------------------------------------- */
/*  BookLayer — the book itself: front cover, eight flipping leaves, back     */
/*  cover. Leaf refs are registered with the parent so the single GSAP        */
/*  master timeline can drive every rotation, depth, and hinge shadow.        */
/* -------------------------------------------------------------------------- */

const TOTAL_PAGES = 17;

const LEAVES = [
  { key: "title", Front: TitlePage, frontProps: { number: 2 }, Back: ProblemLeft, backProps: { number: 3 } },
  { key: "problem", Front: ProblemRight, frontProps: { number: 4 }, Back: LoopLeft, backProps: { number: 5 } },
  { key: "loop", Front: LoopRight, frontProps: { number: 6 }, Back: WorkspaceLeft, backProps: { number: 7 } },
  { key: "workspace", Front: MetricsRight, frontProps: { number: 8 }, Back: AiLeft, backProps: { number: 9 } },
  { key: "ai", Front: BuiltRight, frontProps: { number: 10 }, Back: RoadmapLeft, backProps: { number: 11 } },
  { key: "roadmap", Front: MomentumRight, frontProps: { number: 12 }, Back: MapLeft, backProps: { number: 13 } },
  { key: "map", Front: RolesRight, frontProps: { number: 14 }, Back: FaqLeft, backProps: { number: 15 } },
  { key: "voices", Front: VoicesRight, frontProps: { number: 16 }, Back: CtaInside, backProps: { number: 17 } },
];

export default function BookLayer({ bindLeaves }) {
  const rotations = useRef([]);
  const stacks = useRef([]);
  const shadows = useRef([]);
  const fronts = useRef([]);
  const backs = useRef([]);

  useEffect(() => {
    bindLeaves?.({
      rotations: rotations.current,
      stacks: stacks.current,
      shadows: shadows.current,
      fronts: fronts.current,
      backs: backs.current,
    });
  }, [bindLeaves]);

  return (
    <div className="book">
      <div className="book-block" aria-hidden="true" />
      <div className="book-spine" aria-hidden="true" />

      <div className="book-cover book-cover--left pointer-events-none">
        <CoverPage />
      </div>

      {LEAVES.map((leaf, index) => {
        const { Front, frontProps, Back, backProps, key } = leaf;
        return (
          <div
            key={key}
            ref={(el) => {
              stacks.current[index] = el;
            }}
            className="book-leaf-stack"
            style={{ transform: `translateZ(${4 + index * 2}px)` }}
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
              >
                <Front {...frontProps} total={TOTAL_PAGES} />
              </div>
              <div
                ref={(el) => {
                  backs.current[index] = el;
                }}
                className="book-face book-face--back book-page-surface"
              >
                <Back {...backProps} total={TOTAL_PAGES} />
              </div>
            </div>
          </div>
        );
      })}

      <div className="book-cover book-cover--right pointer-events-none">
        <BackCoverOutside />
      </div>
    </div>
  );
}
