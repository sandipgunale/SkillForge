import PageHeader from "@/components/common/PageHeader";

import { useBookmarks } from "../hooks/useBookmarks";

import BookmarkList from "../components/BookmarkList";

import DashboardSkeleton from "@/features/dashboard/skeletons/DashboardSkeleton";
import ErrorState from "@/components/common/ErrorState";

export default function BookmarkPage() {
  const { data: bookmarks, isLoading, isError } = useBookmarks();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load bookmarks"
        description="Please try again."
      />
    );
  }

  return (
    <main className="space-y-8">
      <PageHeader
        title="Bookmarks"
        description="Your saved learning resources."
      />

      <BookmarkList bookmarks={bookmarks} />
    </main>
  );
}
