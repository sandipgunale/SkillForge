import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "@/components/common/PageHeader";
import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ResourcePagination from "@/features/resources/components/ResourcePagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuizHistory } from "../hooks/useQuizHistory";

import { ROUTES } from "@/constants/routes";

const PAGE_SIZE = 10;

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const SOURCES = ["TOPIC", "LEARNING_PATH"];
const STATUSES = ["IN_PROGRESS", "COMPLETED", "ABANDONED"];

export default function QuizHistoryPage() {
  const [page, setPage] = useState(0);
  const [source, setSource] = useState(undefined);
  const [difficulty, setDifficulty] = useState(undefined);
  const [status, setStatus] = useState(undefined);

  const { data, isLoading, isError, refetch } = useQuizHistory({
    page,
    size: PAGE_SIZE,
    source,
    difficulty,
    status,
  });

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  if (isError) {
    return (
      <PageContainer>
        <ErrorState
          title="Failed to load quiz history"
          description="Please try again."
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const quizzes = data?.content ?? [];

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Quiz History"
        description="Review your past quiz attempts and results."
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={source}
          onValueChange={resetPage(setSource)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Any source" />
          </SelectTrigger>

          <SelectContent>
            {SOURCES.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "TOPIC" ? "Topic" : "Learning Path"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficulty}
          onValueChange={resetPage(setDifficulty)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Any difficulty" />
          </SelectTrigger>

          <SelectContent>
            {DIFFICULTIES.map((option) => (
              <SelectItem key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={resetPage(setStatus)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>

          <SelectContent>
            {STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="shimmer h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="shimmer h-4 w-full" />
                <Skeleton className="shimmer h-4 w-3/4" />
                <Skeleton className="shimmer h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Generate a quiz to start practicing."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    {quiz.topicName ?? quiz.learningPathTitle ?? "Quiz"}
                  </CardTitle>

                  <Badge variant="secondary">{quiz.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{quiz.difficulty}</Badge>

                  <Badge variant="outline">
                    {quiz.source === "TOPIC"
                      ? "Topic"
                      : "Learning Path"}
                  </Badge>

                  {quiz.weekNumber != null && (
                    <Badge variant="outline">
                      Week {quiz.weekNumber}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-muted-foreground">
                    {quiz.totalQuestions} questions
                    {quiz.completedAt
                      ? ` · ${new Date(quiz.completedAt).toLocaleDateString()}`
                      : ""}
                  </p>

                  {quiz.status === "COMPLETED" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link
                        to={ROUTES.QUIZ_RESULT.replace(
                          ":quizId",
                          quiz.id
                        )}
                      >
                        View result
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResourcePagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        pageSize={PAGE_SIZE}
        label="quizzes"
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
