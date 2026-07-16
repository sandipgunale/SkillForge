import BookmarkCard from "./BookmarkCard";
import BookmarkEmptyState from "./BookmarkEmptyState";

export default function BookmarkList({ bookmarks = [] }) {
  if (!bookmarks.length) {
    return <BookmarkEmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.bookmarkId} bookmark={bookmark} />
      ))}
    </div>
  );
}
