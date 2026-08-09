import ChapterRail from "../components/ChapterRail";
import WelcomeSection from "../sections/WelcomeSection";
import StackSection from "../sections/StackSection";
import ArchitectureSection from "../sections/ArchitectureSection";
import AuthSection from "../sections/AuthSection";
import AiSection from "../sections/AiSection";
import PerformanceSection from "../sections/PerformanceSection";
import DatabaseSection from "../sections/DatabaseSection";
import ApiExplorerSection from "../sections/ApiExplorerSection";
import TimelineSection from "../sections/TimelineSection";
import DoneSection from "../sections/DoneSection";
import Stepper from "../components/Stepper";
import useActiveChapter from "../hooks/useActiveChapter";

/* --------------------------------------------------------------------------
   ShowcasePage — the approved "Recruiter Mode" tour:
   Welcome → Core walkthrough (5) → Deep dives (3) → Done.
   Hash navigation is anchor-safe (`#<chapter-id>`); every chapter's motion
   is scoped/reverted inside ChapterShell.
   -------------------------------------------------------------------------- */

export default function ShowcasePage() {
  const activeId = useActiveChapter();
  return (
    <div className="relative">
      <ChapterRail activeId={activeId} />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-24 md:px-6">
        <WelcomeSection />
        <StackSection id="stack" />
        <ArchitectureSection id="architecture" />
        <AuthSection id="auth" />
        <AiSection id="ai" />
        <PerformanceSection id="performance" />
        <DatabaseSection id="database" />
        <ApiExplorerSection id="api" />
        <TimelineSection id="timeline" />
        <DoneSection id="done" />
      </main>
      <Stepper />
    </div>
  );
}