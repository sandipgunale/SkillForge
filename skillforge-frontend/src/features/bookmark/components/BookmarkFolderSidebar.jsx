import { useState } from "react";

import {
  CheckIcon,
  FolderIcon,
  FolderPlusIcon,
  LibraryBigIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useBookmarkFolders } from "../hooks/useBookmarkFolders";
import { useCreateFolder } from "../hooks/useCreateFolder";
import { useDeleteFolder } from "../hooks/useDeleteFolder";
import { useRenameFolder } from "../hooks/useRenameFolder";

export default function BookmarkFolderSidebar({
  selectedFolderId,
  onSelectFolder,
}) {
  const { data: folders = [] } = useBookmarkFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const renameFolder = useRenameFolder();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) return;

    createFolder.mutate(
      { name: trimmed },
      {
        onSuccess: () => setName(""),
      }
    );
  };

  const startRename = (folder) => {
    setEditingId(folder.folderId);
    setEditingName(folder.name);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  const commitRename = (folderId) => {
    const trimmed = editingName.trim();

    if (!trimmed) {
      cancelRename();
      return;
    }

    renameFolder.mutate(
      { folderId, name: trimmed },
      { onSettled: cancelRename }
    );
  };

  const handleDelete = (folder) => {
    if (selectedFolderId === folder.folderId) {
      onSelectFolder(null);
    }

    setConfirmDeleteId(null);

    deleteFolder.mutate(folder.folderId);
  };

  const allFolders = [
    { folderId: null, name: "All bookmarks", bookmarkCount: null },
    ...folders,
  ];

  return (
    <aside className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New folder…"
          aria-label="New folder name"
          maxLength={100}
        />

        <Button
          type="submit"
          size="icon"
          variant="outline"
          disabled={!name.trim() || createFolder.isPending}
          aria-label="Create folder"
        >
          <FolderPlusIcon />
        </Button>
      </form>

      <nav aria-label="Bookmark folders" className="flex flex-col gap-1">
        {allFolders.map((folder) => {
          const isSelected = selectedFolderId === folder.folderId;
          const isEditing = editingId === folder.folderId;

          if (isEditing) {
            return (
              <form
                key={folder.folderId}
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  commitRename(folder.folderId);
                }}
              >
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label={`Rename ${folder.name}`}
                  maxLength={100}
                  autoFocus
                  className="h-9"
                />

                <Button
                  type="submit"
                  size="icon"
                  variant="outline"
                  disabled={!editingName.trim() || renameFolder.isPending}
                  aria-label="Save folder name"
                >
                  <CheckIcon />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={cancelRename}
                  aria-label="Cancel rename"
                >
                  <XIcon />
                </Button>
              </form>
            );
          }

          return (
            <div
              key={folder.folderId ?? "all"}
              className="group flex items-center"
            >
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "flex w-full justify-start gap-2 px-3",
                  isSelected && "bg-accent"
                )}
                onClick={() => onSelectFolder(folder.folderId)}
              >
                {folder.folderId === null ? (
                  <LibraryBigIcon />
                ) : (
                  <FolderIcon />
                )}

                <span className="flex-1 truncate text-left">{folder.name}</span>

                {folder.bookmarkCount != null && (
                  <span className="text-xs text-muted-foreground">
                    {folder.bookmarkCount}
                  </span>
                )}
              </Button>

              {folder.folderId !== null && (
                <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Rename ${folder.name}`}
                    disabled={renameFolder.isPending}
                    onClick={() => startRename(folder)}
                  >
                    <PencilIcon />
                  </Button>

                  <AlertDialog
                    open={confirmDeleteId === folder.folderId}
                    onOpenChange={(open) =>
                      setConfirmDeleteId(open ? folder.folderId : null)
                    }
                  >
                    <AlertDialogTrigger
                      asChild
                      aria-label={`Delete ${folder.name}`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deleteFolder.isPending}
                        onClick={() => setConfirmDeleteId(folder.folderId)}
                      >
                        <Trash2Icon />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete folder?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bookmarks in &quot;{folder.name}&quot; will be kept
                          but moved to uncategorized. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(folder)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
