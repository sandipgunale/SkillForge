import WelcomeBanner from "../components/WelcomeBanner";
import DashboardSection from "../components/DashboardSection";
import StatsGrid from "../components/StatsGrid";
import ContinueLearningCard from "../components/ContinueLearningCard";
import RecentQuizList from "../components/RecentQuizList";
import WeakAreasCard from "../components/WeakAreasCard";

import DashboardSkeleton from "../skeletons/DashboardSkeleton";

import { useDashboard } from "../hooks/useDashboard";
import PageHeader from "@/components/common/PageHeader";

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

      <WelcomeBanner />

      <DashboardSection
        title="Overview"
        description="Track your learning progress."
      >
        <StatsGrid analytics={data} />
      </DashboardSection>

      <DashboardSection
        title="Learning"
        description="Continue your learning journey."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ContinueLearningCard topic={continueLearning} />

          <RecentQuizList quizzes={data.recentQuizScores} />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Performance"
        description="Areas that need attention."
      >
        <WeakAreasCard weakAreas={data.weakAreas} />
      </DashboardSection>
    </main>
  );
}
