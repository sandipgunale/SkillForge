import {
  HeroSectionComponent,
  ProblemSectionComponent,
  DirectionSectionComponent,
  LoopSectionComponent,
  AiSectionComponent,
  RoadmapSectionComponent,
  KnowledgeSectionComponent,
  FaqSectionComponent,
  FinalSectionComponent,
} from "./sections";

/* -------------------------------------------------------------------------- */
/*  Section registry — the nine Forge Fold sections in document order.        */
/*  Kept apart from sections.jsx so that file stays components-only           */
/*  (fast-refresh friendly).                                                  */
/* -------------------------------------------------------------------------- */

export const SECTIONS = [
  { id: "top", Component: HeroSectionComponent },
  { id: "what-is", Component: ProblemSectionComponent },
  { id: "direction", Component: DirectionSectionComponent },
  { id: "how-it-works", Component: LoopSectionComponent },
  { id: "architecture", Component: AiSectionComponent },
  { id: "experience", Component: RoadmapSectionComponent },
  { id: "knowledge", Component: KnowledgeSectionComponent },
  { id: "faq", Component: FaqSectionComponent },
  { id: "final", Component: FinalSectionComponent },
];

/* Navbar-linked section ids. The fold renders a static zero-height marker
   per id (native hash navigation targets the marker, not the scroll-pinned
   section). "top" is excluded — the hero section keeps its own id and is
   never hash-linked. "knowledge" is included so scroll-deferred content
   (the 3D constellation) can observe its static slot. */
export const ANCHORS = ["what-is", "direction", "how-it-works", "architecture", "experience", "knowledge", "faq"];