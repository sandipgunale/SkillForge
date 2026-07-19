import { Star, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { useUserRating } from "../hooks/useUserRating";
import { useRateResource } from "../hooks/useRateResource";
import { useDeleteRating } from "../hooks/useDeleteRating";
import { useState } from "react";

export default function RatingStars({ resourceId, size = 24 }) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data, isLoading } = useUserRating(resourceId);

  const rateMutation = useRateResource();
  const deleteMutation = useDeleteRating();

  const currentRating = data?.rating ?? 0;
  const displayRating = hoveredRating || currentRating;
  const MAX_RATING = 5;

  const loading =
    isLoading || rateMutation.isPending || deleteMutation.isPending;

  function handleRate(value) {
    if (value === currentRating) {
      deleteMutation.mutate(resourceId);
      return;
    }

    rateMutation.mutate({
      resourceId,
      value,
    });
  }

  return (
    <div className="flex items-center gap-1">
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        Array.from({ length: MAX_RATING }).map((_, index) => {
          const value = index + 1;

          return (
            <button
              key={value}
              type="button"
              disabled={loading}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRate(value)}
              className={cn(
                "cursor-pointer transition-all duration-150 hover:scale-125",
                loading && "cursor-not-allowed opacity-70",
              )}
            >
              <Star
                size={size}
                className={cn(
                  value <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground",
                )}
              />
              <p className="text-xs text-muted-foreground">
                {currentRating
                  ? `Your rating: ${currentRating}/5`
                  : "Click a star to rate"}
              </p>
            </button>
          );
        })
      )}
    </div>
  );
}
