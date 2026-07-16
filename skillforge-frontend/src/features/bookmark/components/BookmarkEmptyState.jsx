import { Bookmark } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";

export default function BookmarkEmptyState() {
  return (
    <EmptyState
      icon={<Bookmark className="h-12 w-12" />}
      title="No Bookmarks Yet"
      description="Bookmark your favorite learning resources to access them quickly later."
    />
  );
}
