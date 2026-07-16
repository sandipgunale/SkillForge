import { Award, Brain, Clock, Activity } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function DashboardHero({ analytics }) {
  return (
    <Card className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest opacity-80">
              Welcome Back
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {analytics.learningLevel} Learner
            </h1>

            <p className="mt-3 max-w-xl text-white/90">
              You're making great progress. Keep practicing consistently to
              master every topic.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Metric
              icon={<Award size={20} />}
              label="Health Score"
              value={`${analytics.learningHealthScore}/100`}
            />

            <Metric
              icon={<Brain size={20} />}
              label="Average Score"
              value={`${analytics.overallAverageScore}%`}
            />

            <Metric
              icon={<Clock size={20} />}
              label="Study Time"
              value={analytics.studyHours}
            />

            <Metric
              icon={<Activity size={20} />}
              label="Most Active"
              value={analytics.mostActiveTopic}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
