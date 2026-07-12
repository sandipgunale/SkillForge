import { useLocation } from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";

import ResultHero from "../components/result/ResultHero";
import ScoreCard from "../components/result/ScoreCard";
import StrengthCard from "../components/result/StrengthCard";
import WeaknessCard from "../components/result/WeaknessCard";
import FeedbackCard from "../components/result/FeedbackCard";
import ResultActions from "../components/result/ResultActions";
import QuestionReview from "../components/result/QuestionReview";

export default function QuizResultPage() {
  const { state } = useLocation();

  if (!state) {
    return <PageContainer>Result not found.</PageContainer>;
  }

  return (
    <PageContainer className="space-y-8">
      <ResultHero percentage={state.percentage} />

      <div className="grid gap-6 md:grid-cols-2">
        <ScoreCard score={state.score} maxScore={state.maxScore} />

        <FeedbackCard feedback={state.overallFeedback} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StrengthCard strengths={state.strengths} />

        <WeaknessCard weaknesses={state.weaknesses} />
      </div>

      <QuestionReview questions={state.questions} />

      <ResultActions />
    </PageContainer>
  );
}
