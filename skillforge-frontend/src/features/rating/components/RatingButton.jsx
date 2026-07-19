import { useState } from "react";
import { Star, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useUserRating } from "../hooks/useUserRating";
import RatingDialog from "./RatingDialog";

export default function RatingButton({ resourceId, size = "icon" }) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useUserRating(resourceId);

  const loading = isLoading;

  const rated = data?.rated ?? false;
  const currentRating = data?.rating ?? 0;

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Star
            className={
              rated ? "h-5 w-5 fill-yellow-400 text-yellow-400" : "h-5 w-5"
            }
          />
        )}
      </Button>

      <RatingDialog
        open={open}
        onOpenChange={setOpen}
        resourceId={resourceId}
        currentRating={currentRating}
      />
    </>
  );
}
