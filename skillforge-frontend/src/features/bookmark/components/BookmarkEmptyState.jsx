import { Bookmark } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";

export default function BookmarkEmptyState() {
  return (
    <EmptyState
      icon={Bookmark}
      title="No Bookmarks Yet"
      description="Bookmark your favorite learning resources to access them quickly later."
    />
  );
}
