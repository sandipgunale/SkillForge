import { useState } from "react";

import PageHeader from "@/components/common/PageHeader";

import { useBookmarks } from "../hooks/useBookmarks";

import BookmarkList from "../components/BookmarkList";
import BookmarkFolderSidebar from "../components/BookmarkFolderSidebar";

import ResourcePagination from "@/features/resources/components/ResourcePagination";

import DashboardSkeleton from "@/features/dashboard/skeletons/DashboardSkeleton";
import ErrorState from "@/components/common/ErrorState";

const PAGE_SIZE = 12;

export default function BookmarkPage() {
  const [folderId, setFolderId] = useState(null);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useBookmarks({
    folderId,
    page,
    size: PAGE_SIZE,
  });

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your bookmarks"
        description="Your saved resources are still there — the request didn't go through."
        onRetry={() => refetch()}
      />
    );
  }

  // The server clamps the requested page. When the last bookmark of the
  // last page is removed, the refetch comes back on page 0 — adjust state
  // to match so the UI never sits on an empty out-of-range page.
  if (data && !isLoading && data.page !== page) {
    setPage(data.page);
  }

  const bookmarks = data?.content ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookmarks"
        description="Your saved learning resources, organized by folder."
      />

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <BookmarkFolderSidebar
          selectedFolderId={folderId}
          onSelectFolder={(nextFolderId) => {
            setFolderId(nextFolderId);
            setPage(0);
          }}
        />

        <section className="space-y-6">
          <BookmarkList bookmarks={bookmarks} />

          <ResourcePagination
            page={data?.page ?? 0}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}
