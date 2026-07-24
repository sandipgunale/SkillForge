import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateLearningPathStatus } from "../hooks/useUpdateLearningPathStatus";

export default function LearningPathStatusSelect({ learningPath }) {
  const updateStatus = useUpdateLearningPathStatus();

  function handleStatusChange(status) {
    if (status === learningPath.status) return;

    updateStatus.mutate({
      learningPathId: learningPath.id,
      status,
    });
  }

  return (
    <Select value={learningPath.status} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="ACTIVE">Active</SelectItem>

        <SelectItem value="PAUSED">Paused</SelectItem>

        <SelectItem value="COMPLETED">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
