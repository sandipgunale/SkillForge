import { useParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "../components/StatusBadge";

import { useLearningPath } from "../hooks/useLearningPath";

import LearningPathTimeline from "../components/LearningPathTimeline";
import EditLearningPathDialog from "../components/EditLearningPathDialog";
import LearningPathStatusSelect from "../components/LearningPathStatusSelect";
import DeleteLearningPathDialog from "../components/DeleteLearningPathDialog";
import LearningPathSkeleton from "../components/LearningPathSkeleton";
import LearningPathProgress from "../components/LearningPathProgress";

export default function LearningPathDetailPage() {
  const { learningPathId } = useParams();

  const { data: learningPath, isLoading } = useLearningPath(learningPathId);

  if (isLoading) {
    return <LearningPathSkeleton />;
  }

  if (!learningPath) {
    return <div className="p-8">Learning Path not found.</div>;
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{learningPath.title}</h1>

              <p className="text-muted-foreground mt-2">{learningPath.goal}</p>
            </div>

            <StatusBadge status={learningPath.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Skill Level:</strong> {learningPath.skillLevel}
            </div>

            <div>
              <strong>Duration:</strong> {learningPath.durationWeeks} Weeks
            </div>

            <div>
              <strong>Weekly Hours:</strong> {learningPath.weeklyHours}
            </div>

            <div>
              <strong>Created:</strong>{" "}
              {new Date(learningPath.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-3">
            <EditLearningPathDialog learningPath={learningPath} />

            <LearningPathStatusSelect learningPath={learningPath} />

            <DeleteLearningPathDialog learningPathId={learningPath.id} />
          </div>
        </CardContent>
      </Card>
      <LearningPathProgress roadmap={learningPath.roadmapJson} />
      <LearningPathTimeline
        roadmap={learningPath.roadmapJson}
        learningPathId={learningPath.id}
      />
    </div>
  );
}
