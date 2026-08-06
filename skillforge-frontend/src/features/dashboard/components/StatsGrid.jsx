import {
  Clock3,
  BrainCircuit,
  Trophy,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import CountUp from "@/components/common/CountUp";
import { Card, CardContent } from "@/components/ui/card";
import { staggerList, staggerListItem } from "@/lib/motion";

const stats = [
  {
    title: "Study Time",
    value: (an) => {
      const hours = (an.totalLearningMinutes ?? 0) / 60;

      return (
        <>
          <CountUp to={hours} decimals={hours % 1 !== 0 ? 1 : 0} />
          <span className="text-xl font-semibold text-muted-foreground">h</span>
        </>
      );
    },
    subtitle: "Keep building consistency",
    icon: Clock3,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "Learning Health",
    value: (an) => (
      <>
        <CountUp to={an.learningHealthScore} />
        <span className="text-xl font-semibold text-muted-foreground">
          /100
        </span>
      </>
    ),
    subtitle: "Overall learning score",
    icon: BrainCircuit,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Average Score",
    value: (an) => (
      <>
        <CountUp to={an.overallAverageScore} />
        <span className="text-xl font-semibold text-muted-foreground">%</span>
      </>
    ),
    subtitle: "Across all quizzes",
    icon: Trophy,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    title: "Topics Started",
    value: (an) => <CountUp to={an.totalTopicsStarted} />,
    subtitle: "Topics explored",
    icon: BookOpen,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

export default function StatsGrid({ analytics }) {
  return (
    <motion.section
      variants={staggerList(0.08)}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <motion.div key={item.title} variants={staggerListItem}>
            <Card className="group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="relative p-6">
                <div className="absolute right-4 top-4 opacity-10 transition-all duration-300 group-hover:scale-125">
                  <TrendingUp className="h-14 w-14" />
                </div>

                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${item.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
                    {item.value(analytics)}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
