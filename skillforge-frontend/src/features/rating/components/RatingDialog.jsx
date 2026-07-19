import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import StarRating from "./StarRating";

import { useRateResource } from "../hooks/useRateResource";
import { useDeleteRating } from "../hooks/useDeleteRating";

export default function RatingDialog({
  open,
  onOpenChange,
  resourceId,
  currentRating,
}) {
  const [rating, setRating] = useState(0);

  const rateMutation = useRateResource();
  const deleteMutation = useDeleteRating();

  function handleSubmit() {
    rateMutation.mutate(
      {
        resourceId,
        value: rating,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(resourceId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  const loading = rateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setRating(currentRating ?? 0);
        }

        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this Resource</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-6">
          <StarRating value={rating} onChange={setRating} size={32} />

          <p className="text-sm text-muted-foreground">
            {rating === 0 ? "Select a rating" : `Your Rating: ${rating} ★`}
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          {currentRating && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Remove
            </Button>
          )}

          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
