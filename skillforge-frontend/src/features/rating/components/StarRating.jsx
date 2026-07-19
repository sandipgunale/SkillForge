import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 20,
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className="transition-transform hover:scale-110 disabled:cursor-default"
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
