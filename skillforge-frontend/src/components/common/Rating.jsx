import { Star } from "lucide-react";

export default function Rating({ value = 0, size = 16, showValue = true }) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rounded
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground"
            }
          />
        ))}
      </div>

      {showValue && (
        <span className="text-sm font-medium">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
