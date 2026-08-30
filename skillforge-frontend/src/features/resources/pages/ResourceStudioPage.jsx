import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Code2,
  Dumbbell,
  FileText,
  GripVertical,
  Layers,
  Link as LinkIcon,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";

import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import ErrorState from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useResource } from "../hooks/useResource";
import {
  useContentItems,
  useCreateContentItem,
  useDeleteContentItem,
  useReorderContentItems,
  useUpdateContentItem,
} from "../hooks/useContentItems";
import { getYoutubeEmbedUrl } from "../utils/youtube";
import { ROUTES } from "@/constants/routes";

const CONTENT_TYPE_META = {
  VIDEO: { icon: PlayCircle, label: "Video" },
  ARTICLE: { icon: FileText, label: "Article" },
  BOOK: { icon: BookOpen, label: "Book" },
  PDF: { icon: FileText, label: "PDF" },
  DOCUMENT: { icon: FileText, label: "Document" },
  LINK: { icon: LinkIcon, label: "Link" },
  GITHUB: { icon: Code2, label: "GitHub" },
  EXERCISE: { icon: Dumbbell, label: "Exercise" },
};

const CONTENT_ITEM_TYPES = Object.keys(CONTENT_TYPE_META);

const contentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  type: z.string().min(1, "Type is required."),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL.")
    .or(z.literal(""))
    .optional(),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive("Must be greater than zero.")
    .optional(),
  author: z.string().trim().max(200).optional(),
  isbn: z.string().trim().max(20).optional(),
});

export default function ResourceStudioPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const {
    data: resource,
    isLoading: resourceLoading,
    isError: resourceError,
    refetch: refetchResource,
  } = useResource(resourceId);

  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
    refetch: refetchItems,
  } = useContentItems(resourceId);

  const createContent = useCreateContentItem(resourceId);
  const updateContent = useUpdateContentItem(resourceId);
  const deleteContent = useDeleteContentItem(resourceId);
  const reorderContent = useReorderContentItems(resourceId);

  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleDelete = (item) => deleteContent.mutate(item.id);

  const move = (index, direction) => {
    if (index + direction < 0 || index + direction >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + direction, 0, moved);

    reorderContent.mutate(next.map((item) => item.id));
  };

  const isPending =
    createContent.isPending ||
    updateContent.isPending ||
    deleteContent.isPending ||
    reorderContent.isPending;

  return (
    <PageContainer className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ADMIN)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to admin
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ember">
            <Layers className="size-4" />
            Content Studio
          </div>
          {resourceLoading ? (
            <Skeleton className="h-8 w-64 rounded-lg" />
          ) : (
            <PageHeader
              title={resource?.title ?? "Resource"}
              description={
                resource
                  ? `${resource.type} · ${resource.difficulty} · ${resource.topicName ?? "No topic"}`
                  : "Manage the sections learners will step through."
              }
            />
          )}
        </div>

        <Button onClick={openCreate} disabled={isPending}>
          <Plus className="size-4" />
          Add content
        </Button>
      </div>

      {resourceError ? (
        <ErrorState onRetry={refetchResource} />
      ) : itemsError ? (
        <ErrorState onRetry={refetchItems} />
      ) : itemsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
          <Layers className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No content sections yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a guided learning path by adding videos, articles, books and
            more. They appear in order for learners.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="size-4" />
            Add your first section
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const meta = CONTENT_TYPE_META[item.type] ?? {
              icon: FileText,
              label: item.type,
            };
            const Icon = meta.icon;
            const hasPreview = Boolean(item.youtubeVideoId);

            return (
              <li
                key={item.id}
                draggable
                onDragStart={(event) => {
                  setDragIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex === null || dragIndex === index) return;
                  const next = [...items];
                  const [moved] = next.splice(dragIndex, 1);
                  next.splice(index, 0, moved);
                  setDragIndex(null);
                  reorderContent.mutate(next.map((entry) => entry.id));
                }}
                onDragEnd={() => setDragIndex(null)}
                className={
                  "flex flex-wrap items-center gap-4 rounded-2xl border bg-background p-4 transition-opacity active:cursor-grabbing" +
                  (dragIndex === index ? " opacity-50" : "")
                }
              >
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    {item.required ? (
                      <Badge variant="secondary" className="shrink-0">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {meta.label}
                    {item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}
                    {item.author ? ` · ${item.author}` : ""}
                    {hasPreview ? " · YouTube" : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <GripVertical
                    className="size-4 cursor-grab text-muted-foreground/60"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || isPending}
                    aria-label="Move up"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1 || isPending}
                    aria-label="Move down"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    aria-label={`Edit ${item.title}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <ConfirmDelete onConfirm={() => handleDelete(item)} label="content" />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ContentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onCreate={(payload) =>
          createContent.mutate(payload, {
            onSuccess: () => setDialogOpen(false),
          })
        }
        onUpdate={(payload) =>
          updateContent.mutate(
            { contentItemId: editing.id, payload },
            { onSuccess: () => setDialogOpen(false) },
          )
        }
        isPending={isPending}
      />
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Content form                                  */
/* -------------------------------------------------------------------------- */

function ContentFormDialog({
  open,
  onOpenChange,
  editing,
  onCreate,
  onUpdate,
  isPending,
}) {
  const [required, setRequired] = useState(editing?.required ?? true);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: editing?.title ?? "",
      type: editing?.type ?? "",
      url: editing?.url ?? "",
      description: editing?.description ?? "",
      durationMinutes: editing?.durationMinutes ?? "",
      author: editing?.author ?? "",
      isbn: editing?.isbn ?? "",
    },
  });

  const type = watch("type");
  const url = watch("url");

  const [lastEditingId, setLastEditingId] = useState(editing?.id ?? null);

  if ((editing?.id ?? null) !== lastEditingId) {
    setLastEditingId(editing?.id ?? null);
    reset({
      title: editing?.title ?? "",
      type: editing?.type ?? "",
      url: editing?.url ?? "",
      description: editing?.description ?? "",
      durationMinutes: editing?.durationMinutes ?? "",
      author: editing?.author ?? "",
      isbn: editing?.isbn ?? "",
    });
    setRequired(editing?.required ?? true);
  }

  const embed = type === "VIDEO" && url ? getYoutubeEmbedUrl(url) : "";

  const submit = (values) => {
    const payload = {
      title: values.title,
      type: values.type,
      url: values.url || null,
      description: values.description || null,
      durationMinutes: values.durationMinutes
        ? Number(values.durationMinutes)
        : null,
      required,
      author: values.author || null,
      isbn: values.isbn || null,
    };

    if (editing) onUpdate(payload);
    else onCreate(payload);
  };

  const isEditing = Boolean(editing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit content" : "Add content"}</DialogTitle>
          <DialogDescription>
            Each section becomes a step learners move through in order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-title">Title</Label>
            <Input
              id="content-title"
              placeholder="e.g. Introduction to Spring Beans"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={!!errors.type}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_ITEM_TYPES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {CONTENT_TYPE_META[option].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-duration">Duration (min)</Label>
              <Input
                id="content-duration"
                type="number"
                min="1"
                placeholder="Optional"
                aria-invalid={!!errors.durationMinutes}
                {...register("durationMinutes")}
              />
              {errors.durationMinutes && (
                <p className="text-sm text-destructive">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-url">URL</Label>
            <Input
              id="content-url"
              placeholder="https://..."
              aria-invalid={!!errors.url}
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
            {embed && (
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  title="YouTube preview"
                  src={embed}
                  className="aspect-video w-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-description">Description</Label>
            <Textarea
              id="content-description"
              placeholder="What will learners do or learn here?"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-author">Author</Label>
              <Input
                id="content-author"
                placeholder="Optional"
                {...register("author")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-isbn">ISBN</Label>
              <Input
                id="content-isbn"
                placeholder="For books"
                {...register("isbn")}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
              className="size-4 accent-ember"
            />
            Required for completion
          </label>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEditing ? "Save changes" : "Add section"}
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
            This removes the section from the resource. You can re-add it later.
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
