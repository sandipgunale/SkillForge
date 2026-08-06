import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import LearningPathForm from "./LearningPathForm";
import { useUpdateLearningPath } from "../hooks/useUpdateLearningPath";

export default function EditLearningPathDialog({ learningPath }) {
  const [open, setOpen] = useState(false);

  const updateLearningPath = useUpdateLearningPath();

  function handleSubmit(formData) {
    updateLearningPath.mutate(
      {
        learningPathId: learningPath.id,
        payload: formData,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Learning Path</DialogTitle>
        </DialogHeader>

        <LearningPathForm
          initialValues={learningPath}
          onSubmit={handleSubmit}
          isLoading={updateLearningPath.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
