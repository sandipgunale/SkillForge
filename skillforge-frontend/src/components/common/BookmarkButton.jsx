import { Heart } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/ui/toggle";

export default function BookmarkButton({
  defaultBookmarked = false,
  onChange,
}) {
  const [bookmarked, setBookmarked] = useState(defaultBookmarked);

  const handleChange = () => {
    const next = !bookmarked;

    setBookmarked(next);

    onChange?.(next);
  };

  return (
    <Toggle
      pressed={bookmarked}
      onPressedChange={handleChange}
      aria-label="Bookmark Resource"
      className="data-[state=on]:bg-red-50 data-[state=on]:text-red-500"
    >
      <Heart className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
    </Toggle>
  );
}
