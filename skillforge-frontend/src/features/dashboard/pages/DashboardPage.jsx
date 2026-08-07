import DashboardSection from "../components/DashboardSection";
import StatsGrid from "../components/StatsGrid";
import ContinueLearningCard from "../components/ContinueLearningCard";
import RecentQuizList from "../components/RecentQuizList";
import WeakAreasCard from "../components/WeakAreasCard";

import DashboardSkeleton from "../skeletons/DashboardSkeleton";

import { useDashboard } from "../hooks/useDashboard";

import FadeIn from "@/components/common/FadeIn";
import ErrorState from "@/components/common/ErrorState";

import MissionOverview from "../components/MissionOverview";
import AICenter from "../components/AICenter";
import RecommendationCard from "../components/RecommendationCard";
import WeeklyActivityChart from "../components/WeeklyActivityChart";

import QuizTrendChart from "../components/charts/QuizTrendChart";
import TopicMasteryChart from "../components/charts/TopicMasteryChart";

import InsightsCard from "../components/InsightsCard";
import TopicSummaryCard from "../components/TopicSummaryCard";

import GamificationCard from "@/features/gamification/components/GamificationCard";

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description="Your analytics are saved — the request didn't go through."
        onRetry={() => refetch()}
        diagnostic={String(error?.message ?? "network")}
      />
    );
  }

  const continueLearning = data.topicAnalytics?.[0] ?? null;

  return (
    <main className="space-y-10">
      {/* MISSION OVERVIEW */}
      <MissionOverview analytics={data} />

      {/* AI COMMAND CENTER */}
      <FadeIn delay={0.08}>
        <AICenter analytics={data} />
      </FadeIn>

      {/* STATS */}

      <FadeIn delay={0.15}>
        <StatsGrid analytics={data} />
      </FadeIn>

      {/* CONTINUE + AI */}

      <FadeIn delay={0.2}>
        <DashboardSection
          title="Continue Learning"
          description="Resume your progress and discover what to learn next."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <ContinueLearningCard topic={continueLearning} />

            <RecommendationCard recommendations={data.recommendations} />
          </div>
        </DashboardSection>
      </FadeIn>

      {/* ANALYTICS */}

      <FadeIn delay={0.3}>
        <div id="learning-analytics" className="scroll-mt-24">
          <DashboardSection
            title="Learning Analytics"
            description="Visualise your consistency and quiz performance."
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <WeeklyActivityChart data={data.weeklyActivity} />

              <QuizTrendChart quizzes={data.recentQuizScores} />
            </div>
          </DashboardSection>
        </div>
      </FadeIn>

      {/* INSIGHTS */}

      <FadeIn delay={0.4}>
        <DashboardSection
          title="Performance Insights"
          description="Understand your strengths and opportunities."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <TopicMasteryChart topics={data.topicAnalytics} />

            <InsightsCard analytics={data} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <TopicSummaryCard
              title="Best Performing Topic"
              topic={data.bestTopic}
              variant="best"
            />

            <TopicSummaryCard
              title="Needs Improvement"
              topic={data.worstTopic}
              variant="worst"
            />
          </div>
        </DashboardSection>
      </FadeIn>

      {/* TIMELINE + IMPROVEMENT */}

      <FadeIn delay={0.5}>
        <DashboardSection
          title="Learning Journey"
          description="Track your recent progress and improve weaker areas."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <RecentQuizList quizzes={data.recentQuizScores} />

            <WeakAreasCard weakAreas={data.weakAreas} />
          </div>

          <div className="mt-6">
            <GamificationCard />
          </div>
        </DashboardSection>
      </FadeIn>
    </main>
  );
}
