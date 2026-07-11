import { BookOpen, Clock3, Trophy, Target } from "lucide-react";

import StatCard from "./StatCard";

export default function StatsGrid({ analytics }) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Learning Minutes"
        value={analytics.totalLearningMinutes}
        subtitle="Minutes Spent"
        icon={<Clock3 size={28} />}
      />

      <StatCard
        title="Topics Started"
        value={analytics.totalTopicsStarted}
        subtitle="Learning Topics"
        icon={<BookOpen size={28} />}
      />

      <StatCard
        title="Quizzes Taken"
        value={analytics.totalQuizzesTaken}
        subtitle="Completed"
        icon={<Target size={28} />}
      />

      <StatCard
        title="Average Score"
        value={`${analytics.overallAverageScore}%`}
        subtitle="Overall"
        icon={<Trophy size={28} />}
      />
    </section>
  );
}
