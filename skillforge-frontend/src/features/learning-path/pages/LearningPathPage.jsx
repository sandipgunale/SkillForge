import { useState } from "react";

import LearningPathCard from "../components/LearningPathCard";
import LearningPathForm from "../components/LearningPathForm";

import { useLearningPaths } from "../hooks/useLearningPaths";
import { useCreateLearningPath } from "../hooks/useCreateLearningPath";

import { Button } from "@/components/ui/button";
import EmptyLearningPath from "../components/EmptyLearningPath";
import LearningPathSkeleton from "../components/LearningPathSkeleton";
import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import ErrorState from "@/components/common/ErrorState";

export default function LearningPathPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: learningPaths = [], isLoading, isError, error, refetch } = useLearningPaths();

  const createMutation = useCreateLearningPath();

  function handleCreate(formData) {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  }

  if (isLoading) {
    return <LearningPathSkeleton />;
  }

  if (isError) {
    return (
      <PageContainer>
        <PageHeader
          title="Learning Paths"
          description="Your AI-built roadmaps, ready when you are."
        />
        <ErrorState
          title="Couldn't load your learning paths"
          description="Your roadmaps are saved — the request didn't go through."
          onRetry={() => refetch()}
          diagnostic={String(error?.message ?? "network")}
        />
      </PageContainer>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Learning Paths</h1>

        <Button onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "Create Learning Path"}
        </Button>
      </div>

      {showForm && (
        <LearningPathForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {learningPaths.length === 0 ? (
        <EmptyLearningPath onCreate={() => setShowForm(true)} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {learningPaths.map((learningPath) => (
            <LearningPathCard
              key={learningPath.id}
              learningPath={learningPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
