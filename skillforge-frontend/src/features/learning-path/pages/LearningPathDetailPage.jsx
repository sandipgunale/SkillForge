import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Play, BarChart3, Layers, BookMarked } from "lucide-react";

import StatusBadge from "../components/StatusBadge";
import EditLearningPathDialog from "../components/EditLearningPathDialog";
import LearningPathStatusSelect from "../components/LearningPathStatusSelect";
import DeleteLearningPathDialog from "../components/DeleteLearningPathDialog";
import LearningPathSkeleton from "../components/LearningPathSkeleton";
import LearningPathTimeline from "../components/LearningPathTimeline";
import LearningPathStats from "../components/LearningPathStats";
import LearningPathRecommendation from "../components/LearningPathRecommendation";
import LearningPathSidebar from "../components/LearningPathSidebar";
import FinalAssessmentCard from "../components/FinalAssessmentCard";
import CompletionCard from "../components/CompletionCard";

import { useLearningPath } from "../hooks/useLearningPath";
import { useQuizHistory } from "@/features/quiz/hooks/useQuizHistory";

import { calculateProgress } from "../utils/calculateProgress";

import { ROUTES } from "@/constants/routes";

export default function LearningPathDetailPage() {
  const { learningPathId } = useParams();

  const { data: learningPath, isLoading } = useLearningPath(learningPathId);

  const { data: history, isLoading: historyLoading } = useQuizHistory({
    size: 100,
  });

  const [focusWeek, setFocusWeek] = useState(null);

  const roadmap = learningPath?.roadmapJson;

  const weeks = useMemo(() => roadmap?.weeks ?? [], [roadmap]);

  const {
    completedWeeks,
    totalWeeks,
    progress,
  } = calculateProgress(roadmap);

  const totalResources = useMemo(
    () =>
      weeks.reduce(
        (sum, week) => sum + (week.resources ?? []).length,
        0,
      ),
    [weeks],
  );

  const weekQuizzes = useMemo(() => {
    const byWeek = {};

    if (!learningPathId) return byWeek;

    for (const quiz of history?.content ?? []) {
      if (
        quiz.learningPathId !== learningPathId ||
        quiz.weekNumber == null
      ) {
        continue;
      }

      const existing = byWeek[quiz.weekNumber];

      if (
        !existing ||
        new Date(quiz.completedAt ?? 0) >
          new Date(existing.completedAt ?? 0)
      ) {
        byWeek[quiz.weekNumber] = quiz;
      }
    }

    return byWeek;
  }, [history, learningPathId]);

  const completedQuizzes = Object.values(weekQuizzes).filter(
    (quiz) => quiz.status === "COMPLETED",
  ).length;

  const averageScore = useMemo(() => {
    const completed = Object.values(weekQuizzes).filter(
      (quiz) => quiz.status === "COMPLETED" && quiz.maxScore > 0,
    );

    if (completed.length === 0) return 0;

    return (
      completed.reduce(
        (sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100,
        0,
      ) / completed.length
    );
  }, [weekQuizzes]);

  const weakQuiz = useMemo(() => {
    const completed = Object.values(weekQuizzes).filter(
      (quiz) => quiz.status === "COMPLETED" && quiz.maxScore > 0,
    );

    if (completed.length === 0) return null;

    let weakest = completed[0];

    for (const quiz of completed) {
      const weakestPct = (weakest.score / weakest.maxScore) * 100;

      const currentPct = (quiz.score / quiz.maxScore) * 100;

      if (currentPct < weakestPct) weakest = quiz;
    }

    if ((weakest.score / weakest.maxScore) * 100 >= 60) return null;

    return {
      week: weakest.weekNumber,
      percentage: (weakest.score / weakest.maxScore) * 100,
    };
  }, [weekQuizzes]);

  const currentWeek = useMemo(() => {
    if (totalWeeks === 0) return null;

    let current = null;

    for (let i = 0; i < weeks.length; i += 1) {
      if (weeks[i].completed) continue;

      const previousCompleted =
        i === 0 || Boolean(weeks[i - 1].completed);

      if (previousCompleted) {
        current = weeks[i];

        break;
      }
    }

    return current;
  }, [weeks, totalWeeks]);

  const nextTopic = currentWeek?.topics?.[0]?.name ?? null;

  const allWeeksCompleted =
    totalWeeks > 0 && completedWeeks === totalWeeks;

  if (isLoading || historyLoading) {
    return <LearningPathSkeleton />;
  }

  if (!learningPath) {
    return <div className="p-8">Learning Path not found.</div>;
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                       */}
      {/* ---------------------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LEARNING_PATH}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learning Paths
            </Link>

            <div className="ml-auto">
              <StatusBadge status={learningPath.status} />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              {learningPath.title}
            </h1>

            <p className="mt-2 text-muted-foreground">
              {learningPath.goal}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              {learningPath.skillLevel}
            </Badge>

            <Badge variant="secondary">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              {learningPath.durationWeeks} Weeks
            </Badge>

            <Badge variant="secondary">
              <Play className="mr-1.5 h-3.5 w-3.5" />
              {learningPath.weeklyHours} hrs/week
            </Badge>

            <Badge variant="secondary">
              <BookMarked className="mr-1.5 h-3.5 w-3.5" />
              {totalResources} Resources
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedWeeks}/{totalWeeks} weeks completed
              </span>

              <span className="font-semibold">
                {Math.round(progress)}%
              </span>
            </div>

            <Progress value={progress} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!currentWeek}
              onClick={() =>
                setFocusWeek(currentWeek?.week)
              }
            >
              <Play className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>

            <EditLearningPathDialog learningPath={learningPath} />

            <LearningPathStatusSelect learningPath={learningPath} />

            <DeleteLearningPathDialog
              learningPathId={learningPath.id}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------- */}
      {/* Stats                                                      */}
      {/* ---------------------------------------------------------- */}

      <LearningPathStats
        completedWeeks={completedWeeks}
        totalWeeks={totalWeeks}
        totalResources={totalResources}
        completedQuizzes={completedQuizzes}
        totalQuizzes={totalWeeks}
        averageScore={averageScore}
      />

      {/* ---------------------------------------------------------- */}
      {/* AI Recommendation + Final Assessment                      */}
      {/* ---------------------------------------------------------- */}

      <LearningPathRecommendation
        weeks={weeks}
        weakQuiz={weakQuiz}
        onContinue={setFocusWeek}
      />

      {allWeeksCompleted && (
        <FinalAssessmentCard
          learningPathId={learningPath.id}
        />
      )}

      {learningPath.status === "COMPLETED" && (
        <CompletionCard
          learningPath={learningPath}
          completedWeeks={completedWeeks}
          totalWeeks={totalWeeks}
          totalResources={totalResources}
          completedQuizzes={completedQuizzes}
          averageScore={averageScore}
        />
      )}

      {/* ---------------------------------------------------------- */}
      {/* Timeline + Sidebar                                        */}
      {/* ---------------------------------------------------------- */}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold">Learning Timeline</h2>

          <LearningPathTimeline
            roadmap={roadmap}
            learningPathId={learningPath.id}
            weekQuizzes={weekQuizzes}
            focusWeek={focusWeek}
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <LearningPathSidebar
            progress={progress}
            completedWeeks={completedWeeks}
            totalWeeks={totalWeeks}
            weeks={weeks}
            currentWeek={currentWeek}
            nextTopic={nextTopic}
            onContinue={() =>
              setFocusWeek(currentWeek?.week)
            }
          />
        </div>
      </div>
    </div>
  );
}
