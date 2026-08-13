import CapEmblem from "./cap/CapEmblem";
import CoverPage from "./book/CoverPage";
import { TitlePage, ProblemLeft, ProblemRight } from "./book/pages/TitleAndProblem";
import { LoopLeft, LoopRight } from "./book/pages/LoopPages";
import { WorkspaceLeft, MetricsRight } from "./book/pages/WorkspacePages";
import { AiLeft, BuiltRight } from "./book/pages/AiPages";
import { RoadmapLeft, MomentumRight } from "./book/pages/RoadmapPages";
import { MapLeft, RolesRight } from "./book/pages/KnowledgeAndRoles";
import { FaqLeft, VoicesRight } from "./book/pages/QuestionsPages";
import { CtaInside, BackCoverOutside } from "./book/pages/EndPages";
import HeroContent from "./components/HeroContent";

/* -------------------------------------------------------------------------- */
/*  StaticBook — prefers-reduced-motion layout. The fixed 3D stage never      */
/*  mounts; the same real content renders as a calm, readable book flowing    */
/*  with the page — no transforms, no scrubbing, no motion.                   */
/* -------------------------------------------------------------------------- */

const PAGES = [
  { key: "problem", Left: ProblemLeft, Right: ProblemRight, leftProps: { number: 3 }, rightProps: { number: 4 } },
  { key: "loop", Left: LoopLeft, Right: LoopRight, leftProps: { number: 5 }, rightProps: { number: 6 } },
  { key: "workspace", Left: WorkspaceLeft, Right: MetricsRight, leftProps: { number: 7 }, rightProps: { number: 8 } },
  { key: "ai", Left: AiLeft, Right: BuiltRight, leftProps: { number: 9 }, rightProps: { number: 10 } },
  { key: "roadmap", Left: RoadmapLeft, Right: MomentumRight, leftProps: { number: 11 }, rightProps: { number: 12 } },
  { key: "map", Left: MapLeft, Right: RolesRight, leftProps: { number: 13 }, rightProps: { number: 14 } },
  { key: "voices", Left: FaqLeft, Right: VoicesRight, leftProps: { number: 15 }, rightProps: { number: 16 } },
];

export default function StaticBook() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <section id="top" className="relative flex flex-col items-center py-16 text-center">
        <CapEmblem className="mx-auto mb-8 h-32 w-32 sm:h-40 sm:w-40" />
        <HeroContent />
      </section>

      {/* Title spread */}
      <section className="grid gap-8 lg:grid-cols-2" aria-label="Title page">
        <div className="min-h-[34rem]">
          <CoverPage />
        </div>
        <div className="min-h-[34rem]">
          <TitlePage number={2} total={17} />
        </div>
      </section>

      {/* Chapter spreads */}
      {PAGES.map(({ key, Left, Right, leftProps, rightProps }) => (
        <section key={key} className="mt-8 grid gap-8 lg:grid-cols-2" aria-label={`Chapter ${leftProps.number - 1}`}>
          <div className="min-h-[34rem]">
            <Left {...leftProps} total={17} />
          </div>
          <div className="min-h-[34rem]">
            <Right {...rightProps} total={17} />
          </div>
        </section>
      ))}

      {/* Final CTA + back cover */}
      <section className="mt-8 grid gap-8 lg:grid-cols-2" aria-label="Get started">
        <div className="min-h-[34rem]">
          <CtaInside number={17} total={17} />
        </div>
        <div className="min-h-[34rem]">
          <BackCoverOutside />
        </div>
      </section>
    </div>
  );
}