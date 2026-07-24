import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyLearningPath({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />

      <h2 className="text-2xl font-bold">No Learning Paths Yet</h2>

      <p className="mt-2 text-muted-foreground">
        Create your first AI learning roadmap.
      </p>

      <Button className="mt-6" onClick={onCreate}>
        Create Learning Path
      </Button>
    </div>
  );
}
