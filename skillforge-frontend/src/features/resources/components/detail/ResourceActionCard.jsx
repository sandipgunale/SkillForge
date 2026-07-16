import { ExternalLink } from "lucide-react";

import BookmarkButton from "@/components/common/BookmarkButton";
import { Button } from "@/components/ui/button";

export default function ResourceActionCard({ resource }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Bookmark Resource</span>

        <BookmarkButton onChange={(value) => console.log("Bookmark:", value)} />
      </div>

      <Button className="w-full">
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          Open Resource
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
