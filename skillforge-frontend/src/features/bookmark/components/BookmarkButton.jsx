import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useBookmarkStatus } from "../hooks/useBookmarkStatus";
import { useAddBookmark } from "../hooks/useAddBookmark";
import { useRemoveBookmark } from "../hooks/useRemoveBookmark";

export default function BookmarkButton({ resourceId, size = "icon" }) {
  const { data, isLoading } = useBookmarkStatus(resourceId);

  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const bookmarked = data?.bookmarked ?? false;

  function handleClick() {
    if (bookmarked) {
      removeBookmark.mutate(resourceId);
    } else {
      addBookmark.mutate(resourceId);
    }
  }

  const loading =
    isLoading || addBookmark.isPending || removeBookmark.isPending;

  return (
    <Button
      variant="ghost"
      size={size}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-5 w-5 fill-current text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}
