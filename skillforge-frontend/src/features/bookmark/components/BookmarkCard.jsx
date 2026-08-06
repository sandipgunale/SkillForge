import ResourceCard from "@/features/resources/components/ResourceCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FolderIcon } from "lucide-react";

import { useBookmarkFolders } from "../hooks/useBookmarkFolders";
import { useMoveBookmark } from "../hooks/useMoveBookmark";

export default function BookmarkCard({ bookmark }) {
  const moveBookmark = useMoveBookmark();

  const resource = {
    id: bookmark.resourceId,
    title: bookmark.title,
    description: bookmark.description,
    url: bookmark.url,
    type: bookmark.type,
    difficulty: bookmark.difficulty,
    estimatedMinutes: bookmark.estimatedMinutes,
    topicName: bookmark.topicName,

    avgRating: bookmark.avgRating,
    ratingCount: bookmark.ratingCount,

    topic: {
      id: bookmark.topicId,
      name: bookmark.topicName,
    },

    tags: [],
  };

  return (
    <div className="relative">
      <ResourceCard resource={resource} />

      <FolderMenu bookmark={bookmark} moveBookmark={moveBookmark} />
    </div>
  );
}

function FolderMenu({ bookmark, moveBookmark }) {
  const { data: folders = [] } = useBookmarkFolders();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-3 top-3 size-8"
            aria-label="Move bookmark to folder"
          />
        }
      >
        <FolderIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Move to folder</DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={moveBookmark.isPending}
          onClick={() =>
            moveBookmark.mutate({
              resourceId: bookmark.resourceId,
              folderId: null,
            })
          }
        >
          <span className="pl-1">Uncategorized</span>
        </DropdownMenuItem>

        {folders.map((folder) => (
          <DropdownMenuItem
            key={folder.folderId}
            disabled={moveBookmark.isPending}
            onClick={() =>
              moveBookmark.mutate({
                resourceId: bookmark.resourceId,
                folderId: folder.folderId,
              })
            }
          >
            <FolderIcon />
            {folder.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
