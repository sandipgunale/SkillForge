import DashboardSection from "../components/DashboardSection";
import StatsGrid from "../components/StatsGrid";
import ContinueLearningCard from "../components/ContinueLearningCard";
import RecentQuizList from "../components/RecentQuizList";
import WeakAreasCard from "../components/WeakAreasCard";

import DashboardSkeleton from "../skeletons/DashboardSkeleton";

import { useDashboard } from "../hooks/useDashboard";
import PageHeader from "@/components/common/PageHeader";

import QuizTrendChart from "../components/charts/QuizTrendChart";
import TopicMasteryChart from "../components/charts/TopicMasteryChart";

import InsightsCard from "../components/InsightsCard";

import DashboardHero from "../components/DashboardHero";

import WeeklyActivityChart from "../components/WeeklyActivityChart";

import RecommendationCard from "../components/RecommendationCard";
import TopicSummaryCard from "../components/TopicSummaryCard";

import FadeIn from "@/components/common/FadeIn";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500 p-6">
        Failed to load dashboard.
      </div>
    );
  }

  const continueLearning = data.topicAnalytics?.[0] ?? null;

  return (
    <main className="space-y-10">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Continue your learning journey."
      />

      <FadeIn delay={0.1}>
        <DashboardHero analytics={data} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <DashboardSection
          title="Overview"
          description="Track your learning progress."
        >
          <StatsGrid analytics={data} />

          <div className="grid gap-6 lg:grid-cols-2">
            <QuizTrendChart quizzes={data.recentQuizScores} />

            <TopicMasteryChart topics={data.topicAnalytics} />
          </div>
        </DashboardSection>
      </FadeIn>

      <FadeIn delay={0.3}>
        <DashboardSection
          title="Weekly Activity"
          description="Track your daily learning consistency."
        >
          <WeeklyActivityChart data={data.weeklyActivity} />
        </DashboardSection>
      </FadeIn>

      <FadeIn delay={0.4}>
        <DashboardSection
          title="Performance Highlights"
          description="Your strongest and weakest learning areas."
        >
          <div className="grid gap-6 lg:grid-cols-2">
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

      <FadeIn delay={0.5}>
        <DashboardSection
          title="Learning"
          description="Continue your learning journey."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ContinueLearningCard topic={continueLearning} />

            <RecentQuizList quizzes={data.recentQuizScores} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RecommendationCard recommendations={data.recommendations} />

            <InsightsCard analytics={data} />
          </div>
        </DashboardSection>
      </FadeIn>

      <FadeIn delay={0.6}>
        <DashboardSection
          title="Performance"
          description="Areas that need attention."
        >
          <WeakAreasCard weakAreas={data.weakAreas} />
        </DashboardSection>
      </FadeIn>
    </main>
  );
}
