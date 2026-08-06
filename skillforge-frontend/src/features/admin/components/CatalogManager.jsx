import { useState } from "react";
import { FolderTree, Hash, Pencil, Plus, Trash2 } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ErrorState from "@/components/common/ErrorState";

import {
  useCreateTag,
  useCreateTopic,
  useDeleteTag,
  useDeleteTopic,
  useTagsList,
  useTopicsList,
  useUpdateTag,
  useUpdateTopic,
} from "../hooks/useCatalog";

const topicSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  description: z.string().trim().min(1, "Description is required.").max(500),
});

const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(50),
});

export default function CatalogManager() {
  const {
    data: topics = [],
    isLoading: topicsLoading,
    isError: topicsError,
    refetch: refetchTopics,
  } = useTopicsList();

  const {
    data: tags = [],
    isLoading: tagsLoading,
    isError: tagsError,
    refetch: refetchTags,
  } = useTagsList();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <FolderTree className="size-4 text-muted-foreground" />
              Topics
            </h2>
            <p className="text-xs text-muted-foreground">
              Organize resources into learning areas.
            </p>
          </div>

          <TopicFormDialog />
        </div>

        {topicsError ? (
          <ErrorState onRetry={refetchTopics} />
        ) : topicsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No topics yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {topics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <Hash className="size-4 text-muted-foreground" />
              Tags
            </h2>
            <p className="text-xs text-muted-foreground">
              Lightweight labels for filtering.
            </p>
          </div>

          <TopicFormDialog isTag />
        </div>

        {tagsError ? (
          <ErrorState onRetry={refetchTags} />
        ) : tagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No tags yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagRow key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Topic row                                   */
/* -------------------------------------------------------------------------- */

function TopicRow({ topic }) {
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{topic.name}</p>
        <p className="truncate text-xs text-muted-foreground">{topic.slug}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <TopicFormDialog topic={topic} onSubmit={(values) => updateTopic.mutate({ topicId: topic.id, payload: values })} />
        <ConfirmDelete onConfirm={() => deleteTopic.mutate(topic.id)} />
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Tag row                                    */
/* -------------------------------------------------------------------------- */

function TagRow({ tag }) {
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  return (
    <Badge variant="secondary" className="gap-1.5 py-1.5 pr-1.5 pl-3">
      <span>{tag.name}</span>

      <TopicFormDialog
        isTag
        topic={tag}
        onSubmit={(values) => updateTag.mutate({ tagId: tag.id, payload: values })}
      />

      <ConfirmDelete onConfirm={() => deleteTag.mutate(tag.id)} />
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Topic form                                   */
/* -------------------------------------------------------------------------- */

function TopicFormDialog({ topic = null, onSubmit, isTag = false }) {
  const [open, setOpen] = useState(false);

  const createTopic = useCreateTopic();
  const createTag = useCreateTag();

  const schema = isTag ? tagSchema : topicSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: topic?.name ?? "",
      description: topic?.description ?? "",
    },
  });

  const isEditing = Boolean(topic);
  const isPending = createTopic.isPending || createTag.isPending;

  const handleCreate = (values) => {
    if (isTag) {
      createTag.mutate({ name: values.name });
    } else {
      createTopic.mutate({ name: values.name, description: values.description });
    }

    reset();
    setOpen(false);
  };

  const trigger = isTag ? (
    <button
      type="button"
      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      aria-label={`Edit tag ${topic?.name}`}
    >
      <Pencil className="size-3.5" />
    </button>
  ) : isEditing ? (
    <button
      type="button"
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      aria-label={`Edit topic ${topic.name}`}
    >
      <Pencil className="size-4" />
    </button>
  ) : (
    <Button size="sm" variant="outline">
      <Plus className="size-4" />
      New
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Edit ${isTag ? "tag" : "topic"}`
              : `New ${isTag ? "tag" : "topic"}`}
          </DialogTitle>

          <DialogDescription>
            {isTag
              ? "Short labels help learners filter content."
              : "Topics group resources into learning areas."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) =>
            isEditing ? onSubmit?.(values) : handleCreate(values)
          )}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor={`${isTag ? "tag" : "topic"}-name`}>Name</Label>
            <Input
              id={`${isTag ? "tag" : "topic"}-name`}
              placeholder={isTag ? "e.g. react-hooks" : "e.g. React"}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {!isTag && (
            <div className="space-y-2">
              <Label htmlFor="topic-description">Description</Label>
              <Textarea
                id="topic-description"
                placeholder="What will learners explore here?"
                rows={3}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEditing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Confirm delete                                */
/* -------------------------------------------------------------------------- */

function ConfirmDelete({ onConfirm, label = "item" }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            aria-label={`Delete ${label}`}
          >
            <Trash2 className="size-4" />
          </button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Resources linked to it may be
            affected.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
