import { useLocation, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";

import QuizSetupForm from "../components/QuizSetupForm";
import PageContainer from "@/components/common/PageContainer";

export default function QuizSetupPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const preselection = {
    ...(location.state ?? {}),
    topicId: searchParams.get("topicId") ?? location.state?.topicId,
    topicName: searchParams.get("topicName") ?? location.state?.topicName,
    lessonId: searchParams.get("lessonId") ?? location.state?.lessonId,
  };

  return (
    <PageContainer size="wide" className="py-6 sm:py-10 md:py-12">
      {/* Editorial Hero Header */}
      <div className="flex flex-col gap-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <Sparkles className="size-3.5" />
          <span>Quiz Forge / Practice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-heading">
          Forge your <span className="text-primary">next challenge</span>.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Turn a topic or structured learning path into focused practice, calibrated precisely to your current level.
        </p>
      </div>

      {/* Main Workspace */}
      <QuizSetupForm preselection={preselection} />
    </PageContainer>
  );
}
