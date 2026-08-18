import ArrivalSection from "./sections/ArrivalSection";
import { ProblemSection, ShiftSection } from "./sections/statements";
import EngineSection from "./sections/EngineSection";
import {
  ResourcesSection,
  AiSection,
  PracticeSection,
  RoadmapSection,
  ProgressSection,
} from "./sections/product";
import { WhySection } from "./sections/WhySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { HowSection } from "./sections/HowSection";
import FaqSection from "./sections/FaqSection";
import MasterySection from "./sections/MasterySection";

/* -------------------------------------------------------------------------- */
/*  Landing section registry — the 15-scene narrative (00 ARRIVAL → 14       */
/*  FOOTER), in document order. Sections render in native flow (Approach A:  */
/*  sticky scenes, no fold machinery). The ids are the native hash targets.  */
/* -------------------------------------------------------------------------- */

export const SECTIONS = [
  { id: "top", Component: ArrivalSection },
  { id: "problem", Component: ProblemSection },
  { id: "shift", Component: ShiftSection },
  { id: "engine", Component: EngineSection },
  { id: "resources", Component: ResourcesSection },
  { id: "ai", Component: AiSection },
  { id: "practice", Component: PracticeSection },
  { id: "roadmap", Component: RoadmapSection },
  { id: "progress", Component: ProgressSection },
  { id: "why", Component: WhySection },
  { id: "experience", Component: ExperienceSection },
  { id: "how", Component: HowSection },
  { id: "faq", Component: FaqSection },
  { id: "mastery", Component: MasterySection },
];

/* Navbar-linked section ids (native hash targets). "top" is excluded — the
   hero owns its scroll position and is never hash-linked. */
export const NAV_LINKS = [
  { label: "Engine", href: "#engine" },
  { label: "Practice", href: "#practice" },
  { label: "Paths", href: "#roadmap" },
  { label: "Progress", href: "#progress" },
  { label: "FAQ", href: "#faq" },
];

/* Section top positions in document coordinates, measured once per
   resize/font-ready — never per scroll frame (shared by the navbar and the
   progress chrome). */
export function measureSectionTops(ids) {
  const tops = {};
  for (const id of ids) {
    const section = document.querySelector(`[data-landing-section="${id}"]`);
    tops[id] = section ? section.getBoundingClientRect().top + window.scrollY : Infinity;
  }
  return tops;
}

/* A section counts as "current" once its top reaches this viewport offset —
   matches the anchor rest position (scroll-margin-top: 80px), so the nav
   highlight and progress readout agree after a hash-link jump. */
export const SECTION_ACTIVE_OFFSET = 80;

/* -------------------------------------------------------------------------- */
/*  Shared measurement plumbing — the navbar and the progress chrome both     */
/*  need section tops that self-heal the lazy-chunk race and the             */
/*  fallback→webfont reflow. One implementation, two consumers.               */
/* -------------------------------------------------------------------------- */

export const MAX_PROBE_FRAMES = 600;

/** The landing page chunk mounts the sections after the navbar's first
 *  measure (lazy route) — probe every frame until a section lands, then
 *  notify. Bounded (~10s) and cancelled on unmount so a failed chunk can't
 *  leave a 60fps loop. Returns the cleanup function. */
export function probeUntilSectionsReady(onReady) {
  let frames = 0;
  let raf = 0;
  const tick = () => {
    if (document.querySelector("[data-landing-section]")) {
      onReady();
    } else if (frames++ < MAX_PROBE_FRAMES) {
      raf = requestAnimationFrame(tick);
    }
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** fonts.ready can settle before the lazy chunk's fonts start loading —
 *  subscribe to every loading batch so the fallback→webfont reflow
 *  re-measures instead of going stale until resize. Returns cleanup. */
export function subscribeFontsReady(onLoaded) {
  if (!document.fonts) return () => {};
  document.fonts.addEventListener("loadingdone", onLoaded);
  document.fonts.addEventListener("loadingerror", onLoaded);
  document.fonts.ready.then(onLoaded).catch(onLoaded);
  return () => {
    document.fonts.removeEventListener("loadingdone", onLoaded);
    document.fonts.removeEventListener("loadingerror", onLoaded);
  };
}

/** Highest section whose top has crossed the active offset — shared by the
 *  navbar highlight and the progress readout so they always agree. */
export function resolveActiveSection(tops, ids, y) {
  let current = null;
  for (const id of ids) {
    if (tops[id] <= y + SECTION_ACTIVE_OFFSET) current = id;
  }
  return current;
}