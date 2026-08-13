import CapEmblem from "./cap/CapEmblem";
import { TitlePage, ProblemLeft, ProblemRight } from "./book/pages/TitleAndProblem";
import { LoopLeft, LoopRight } from "./book/pages/LoopPages";
import { WorkspaceLeft, MetricsRight } from "./book/pages/WorkspacePages";
import { AiLeft, BuiltRight } from "./book/pages/AiPages";
import { RoadmapLeft, MomentumRight } from "./book/pages/RoadmapPages";
import { MapLeft, RolesRight } from "./book/pages/KnowledgeAndRoles";
import { FaqLeft, VoicesRight } from "./book/pages/QuestionsPages";
import { CtaInside } from "./book/pages/EndPages";
import HeroContent from "./components/HeroContent";

/* -------------------------------------------------------------------------- */
/*  StaticBook — prefers-reduced-motion layout. The fixed 3D stage never      */
/*  mounts; the same real content renders as a calm, readable book flowing    */
/*  with the page — one page at a time, right-hand spine, no transforms,      */
/*  no scrubbing, no motion.                                                  */
/* -------------------------------------------------------------------------- */

const TOTAL_PAGES = 16;

const PAGES = [
  { key: "problem-open", id: "what-is", Page: ProblemLeft, number: 2 },
  { key: "problem-answer", Page: ProblemRight, number: 3 },
  { key: "loop-open", id: "how-it-works", Page: LoopLeft, number: 4 },
  { key: "loop-continued", Page: LoopRight, number: 5 },
  { key: "workspace-open", Page: WorkspaceLeft, number: 6 },
  { key: "metrics", Page: MetricsRight, number: 7 },
  { key: "ai-open", Page: AiLeft, number: 8 },
  { key: "built", id: "architecture", Page: BuiltRight, number: 9 },
  { key: "roadmap-open", Page: RoadmapLeft, number: 10 },
  { key: "momentum", id: "experience", Page: MomentumRight, number: 11 },
  { key: "map", Page: MapLeft, number: 12 },
  { key: "roles", Page: RolesRight, number: 13 },
  { key: "faq", id: "faq", Page: FaqLeft, number: 14 },
  { key: "voices", Page: VoicesRight, number: 15 },
];

function StaticPage({ id, Page, number }) {
  return (
    <section id={id} aria-label={`Page ${number}`} className="book-static-page mx-auto max-w-4xl">
      <div className="h-[clamp(540px,78vh,900px)] overflow-hidden rounded-[10px]">
        <Page number={number} total={TOTAL_PAGES} />
      </div>
      <div aria-hidden="true" className="book-static-spine" />
    </section>
  );
}

export default function StaticBook() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <section id="top" className="relative flex flex-col items-center py-16 text-center">
        <CapEmblem className="mx-auto mb-8 h-32 w-32 sm:h-40 sm:w-40" />
        <HeroContent />
      </section>

      {/* Title page */}
      <div className="mt-4">
        <StaticPage Page={TitlePage} number={1} />
      </div>

      {/* The book, one page at a time */}
      <div className="mt-8 space-y-8">
        {PAGES.map(({ key, ...page }) => (
          <StaticPage key={key} {...page} />
        ))}
      </div>

      {/* Final CTA */}
      <div className="mt-8">
        <StaticPage Page={CtaInside} number={16} />
      </div>
    </div>
  );
}
