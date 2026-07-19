import { ExternalLink } from "lucide-react";

import BookmarkButton from "@/features/bookmark/components/BookmarkButton";
import RatingStars from "@/features/rating/components/RatingStars";

import { Button } from "@/components/ui/button";

export default function ResourceActionCard({ resource }) {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Bookmark Resource</span>

        <BookmarkButton resourceId={resource.id} />
      </div>

      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-medium">Rate this Resource</p>

        <RatingStars resourceId={resource.id} />
      </div>

      <Button asChild className="w-full">
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          Open Resource
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
