import { Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import StatusBadge from "./StatusBadge";
import { ROUTES } from "@/constants/routes";

export default function LearningPathCard({ learningPath }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{learningPath.title}</CardTitle>

        <StatusBadge status={learningPath.status} />
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{learningPath.goal}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Skill:</strong> {learningPath.skillLevel}
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
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Link
          to={ROUTES.LEARNING_PATH_DETAIL.replace(
            ":learningPathId",
            learningPath.id,
          )}
        >
          <Button>View →</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
