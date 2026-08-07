import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import Spinner from "@/components/common/Spinner";

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
        aria-label={rated ? "Update your rating" : "Rate this resource"}
      >
        {loading ? (
          <Spinner className="size-5" />
        ) : (
          <Star
            className={
              rated ? "h-5 w-5 fill-warning text-warning" : "h-5 w-5"
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
