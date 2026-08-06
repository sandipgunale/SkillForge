import {
  UsersIcon,
  BookOpenIcon,
  ListChecksIcon,
  LayersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminStats } from "../hooks/useAdminData";

export default function StatsPanel() {
  const { data: stats } = useAdminStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<UsersIcon />}
        label="Total users"
        value={stats?.totalUsers ?? 0}
      />
      <StatCard
        icon={<LayersIcon />}
        label="Topics"
        value={stats?.totalTopics ?? 0}
      />
      <StatCard
        icon={<BookOpenIcon />}
        label="Resources"
        value={stats?.totalResources ?? 0}
      />
      <StatCard
        icon={<ListChecksIcon />}
        label="Quizzes completed"
        value={stats?.completedQuizzes ?? 0}
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
