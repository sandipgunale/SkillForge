import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
  Library,
  Lock,
  Medal,
  Route,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import CountUp from "@/components/common/CountUp";
import PageHeader from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";
import { SPRING_SOFT, staggerList, staggerListItem } from "@/lib/motion";

import { useGamification } from "../hooks/useGamification";

const LEVELS = [
  { key: "BEGINNER", label: "Beginner", min: 0 },
  { key: "INTERMEDIATE", label: "Intermediate", min: 200 },
  { key: "ADVANCED", label: "Advanced", min: 500 },
  { key: "LEGEND", label: "Legend", min: 1000 },
];

const BADGE_ICONS = {
  FIRST_QUIZ: ClipboardCheck,
  QUIZ_MASTER: Medal,
  PERFECT_SCORE: Target,
  FIRST_BOOKMARK: Bookmark,
  BOOKMARK_COLLECTOR: Library,
  FIRST_RATING: Star,
  PATH_COMPLETER: Route,
};

export default function AchievementsPage() {
  const { data, isLoading } = useGamification();

  const levelInfo = useMemo(() => {
    if (!data) return null;

    const points = data.points ?? 0;
    const index = LEVELS.findLastIndex((lvl) => points >= lvl.min);

    return { points, index: index === -1 ? 0 : index };
  }, [data]);

  if (isLoading || !data || !levelInfo) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-3xl border bg-card/60" />
        <div className="h-56 animate-pulse rounded-3xl border bg-card/60" />
      </div>
    );
  }

  const badgesEarned = data.badges?.length ?? 0;
  const current = LEVELS[levelInfo.index];
  const next = LEVELS[levelInfo.index + 1];
  const levelProgress = next
    ? ((levelInfo.points - current.min) / (next.min - current.min)) * 100
    : 100;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gamification"
        title="Achievements"
        description="Track your progress, earn badges through real learning behavior, and watch your points grow."
        action={
          <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
            <Trophy className="size-4 text-warning" />
            <span className="text-sm font-semibold">{current.label}</span>
          </div>
        }
      />

      <motion.div
        variants={staggerList(0.08)}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-4 text-warning" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="display text-3xl font-bold">
              <CountUp to={levelInfo.points} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {next
                ? `${next.min - levelInfo.points} points to ${next.label}`
                : "Maximum level reached"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Medal className="size-4 text-warning" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="display text-3xl font-bold">
              <CountUp to={badgesEarned} />
              <span className="text-lg text-muted-foreground">
                {" "}
                / {data.catalog?.length ?? 0}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Collect them all by hitting every milestone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4 text-warning" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="display text-3xl font-bold">{current.label}</p>
            <Progress value={levelProgress} className="mt-3 h-2" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {next
                ? `${levelInfo.points} / ${next.min} points`
                : "Legend — nothing left to conquer"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="display text-xl font-bold">Badge Catalog</h2>
          <Badge variant="secondary">
            {badgesEarned} of {data.catalog?.length ?? 0} earned
          </Badge>
        </div>

        <motion.div
          variants={staggerList(0.06)}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {(data.catalog ?? []).map((badge) => {
            const Icon = BADGE_ICONS[badge.code] ?? Trophy;
            const earned = badge.earned;
            const ratio = badge.target > 0 ? badge.current / badge.target : 0;

            return (
              <motion.div
                key={badge.code}
                variants={staggerListItem}
                whileHover={{ y: -3 }}
                transition={SPRING_SOFT}
              >
                <Card
                  className={cn(
                    "h-full",
                    earned &&
                      "border-ember/40 bg-gradient-to-br from-ember/10 via-card to-card shadow-lg shadow-ember/5",
                  )}
                >
                  <CardHeader>
                    <div className="flex w-full items-start justify-between">
                      <motion.div
                        transition={SPRING_SOFT}
                        className={cn(
                          "relative flex size-12 items-center justify-center rounded-2xl border shadow-sm",
                          earned
                            ? "border-ember/40 bg-ember/15 text-ember"
                            : "border-muted bg-muted text-muted-foreground",
                        )}
                      >
                        {!earned && (
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 rounded-2xl bg-muted/40 blur-xl"
                          />
                        )}
                        <Icon className="size-6" strokeWidth={1.75} />
                      </motion.div>

                      {earned ? (
                        <Badge className="gap-1 bg-ember/15 text-ember hover:bg-ember/20">
                          <CheckCircle2 className="size-3" />
                          Earned
                        </Badge>
                      ) : (
                        <Lock className="size-4 text-muted-foreground/50" />
                      )}
                    </div>

                    <CardTitle className="mt-3 text-lg">{badge.name}</CardTitle>

                    <CardDescription className="text-sm">
                      {badge.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Progress value={ratio * 100} className="h-1.5" />

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          "font-semibold",
                          earned ? "text-ember" : "text-muted-foreground",
                        )}
                      >
                        {badge.current} / {badge.target}
                      </span>

                      {earned && badge.awardedAt && (
                        <span className="text-muted-foreground">
                          {new Date(badge.awardedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}