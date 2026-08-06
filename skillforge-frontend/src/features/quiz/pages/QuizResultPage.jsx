import { useLocation, useParams } from "react-router-dom";
import { Info } from "lucide-react";

import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";

import ResultHero from "../components/result/ResultHero";
import ScoreCard from "../components/result/ScoreCard";
import StrengthCard from "../components/result/StrengthCard";
import WeaknessCard from "../components/result/WeaknessCard";
import FeedbackCard from "../components/result/FeedbackCard";
import ResultActions from "../components/result/ResultActions";
import QuestionReview from "../components/result/QuestionReview";
import { QuizResultSkeleton } from "../components/loading/QuizSkeleton";

import { useQuizResult } from "../hooks/useQuizResult";

export default function QuizResultPage() {
  const { quizId } = useParams();

  const { state } = useLocation();

  const { data, isLoading, isError, refetch } = useQuizResult(quizId, !state);

  const result = state ?? data;

  if (isLoading) {
    return (
      <PageContainer>
        <QuizResultSkeleton />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <ErrorState title="Unable to load quiz result" onRetry={refetch} />
      </PageContainer>
    );
  }

  if (!result) {
    return (
      <PageContainer>
        <ErrorState
          title="Result not found"
          description="Quiz result does not exist."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      {result.aiEvaluated === false && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Gemini was unreachable when you submitted, so this result was
            graded offline. Your score is accurate — revisit the review below
            after the AI service is back for detailed feedback.
          </p>
        </div>
      )}

      <ResultHero percentage={result.summary.percentage} />

      <div className="grid gap-6 md:grid-cols-2">
        <ScoreCard
          score={result.summary.score}
          maxScore={result.summary.maxScore}
        />

        <FeedbackCard feedback={result.insight.overallFeedback} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StrengthCard strengths={result.insight.strengths} />

        <WeaknessCard weaknesses={result.insight.weaknesses} />
      </div>

      <QuestionReview questions={result.questions} />

      <ResultActions />
    </PageContainer>
  );
}
