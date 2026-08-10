import { useState } from "react";
import { Archive, BookOpen, Pencil, Plus, RotateCcw, Search } from "lucide-react";

import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ErrorState from "@/components/common/ErrorState";

import {
  useAdminResources,
  useCreateResource,
  useDeleteResource,
  useRestoreResource,
  useUpdateResource,
} from "../hooks/useAdminResources";
import { useTopicsList } from "../hooks/useCatalog";

const resourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(1000),
  url: z
    .string()
    .trim()
    .regex(/^https?:\/\//, "Must be a valid http(s) URL."),
  type: z.string().min(1, "Type is required."),
  difficulty: z.string().min(1, "Difficulty is required."),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .positive("Must be greater than zero."),
  topicId: z.string().min(1, "Topic is required."),
});

const RESOURCE_TYPES = ["VIDEO", "ARTICLE", "COURSE", "DOCS", "BOOK"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function ResourcesManager() {
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useAdminResources({
    search,
    includeInactive,
    page,
  });

  const resources = data?.resources ?? [];

  return (
    <section className="rounded-2xl border bg-background p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <BookOpen className="size-4 text-muted-foreground" />
            Resources
          </h2>
          <p className="text-xs text-muted-foreground">
            Create, edit, deactivate and restore learning resources.
          </p>
        </div>

        <ResourceFormDialog />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search resources..."
            className="pl-9"
            aria-label="Search resources"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => {
              setIncludeInactive(event.target.checked);
              setPage(0);
            }}
            className="size-4 accent-ember"
          />
          Include deactivated
        </label>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No resources found.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {resources.map((resource) => (
              <ResourceRow key={resource.id} resource={resource} />
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {data.page + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={data.first}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={data.last}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Resource row                                 */
/* -------------------------------------------------------------------------- */

function ResourceRow({ resource }) {
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const restoreResource = useRestoreResource();

  const handleUpdate = (values) =>
    updateResource.mutate({ resourceId: resource.id, payload: values });

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{resource.title}</p>
          {resource.active === false ? (
            <Badge variant="destructive" className="gap-1">
              <Archive className="size-3" />
              Deactivated
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-600">
              Active
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {resource.type} · {resource.difficulty} ·{" "}
          {resource.topicName ?? "No topic"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {resource.active === false ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => restoreResource.mutate(resource.id)}
            disabled={restoreResource.isPending}
          >
            <RotateCcw className="size-3.5" />
            Restore
          </Button>
        ) : (
          <>
            <ResourceFormDialog
              resource={resource}
              onSubmit={handleUpdate}
            />
            <ConfirmDelete
              onConfirm={() => deleteResource.mutate(resource.id)}
              label="resource"
            />
          </>
        )}
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Resource form                                 */
/* -------------------------------------------------------------------------- */

function ResourceFormDialog({ resource = null, onSubmit }) {
  const [open, setOpen] = useState(false);

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  const { data: topics = [], isLoading: topicsLoading } = useTopicsList();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: resource?.title ?? "",
      description: resource?.description ?? "",
      url: resource?.url ?? "",
      type: resource?.type ?? "",
      difficulty: resource?.difficulty ?? "",
      estimatedMinutes: resource?.estimatedMinutes ?? "",
      topicId: resource?.topicId ?? "",
    },
  });

  const isEditing = Boolean(resource);
  const isPending = createResource.isPending || updateResource.isPending;

  const handleCreate = (values) => {
    createResource.mutate(values, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  const submit = (values) => {
    const payload = { ...values, tagIds: [] };
    return isEditing ? onSubmit(payload) : handleCreate(payload);
  };

  const trigger = isEditing ? (
    <button
      type="button"
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      aria-label={`Edit resource ${resource.title}`}
    >
      <Pencil className="size-4" />
    </button>
  ) : (
    <Button size="sm" variant="outline">
      <Plus className="size-4" />
      New resource
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit resource" : "New resource"}</DialogTitle>
          <DialogDescription>
            Resources are shared with learners across the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              placeholder="e.g. Spring Boot in Action"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              placeholder="What will learners get from this resource?"
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

          <div className="space-y-2">
            <Label htmlFor="resource-url">URL</Label>
            <Input
              id="resource-url"
              placeholder="https://..."
              aria-invalid={!!errors.url}
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              name="type"
              label="Type"
              control={control}
              error={errors.type?.message}
              placeholder="Select type"
              options={RESOURCE_TYPES}
            />

            <SelectField
              name="difficulty"
              label="Difficulty"
              control={control}
              error={errors.difficulty?.message}
              placeholder="Select difficulty"
              options={DIFFICULTIES}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resource-minutes">Estimated minutes</Label>
              <Input
                id="resource-minutes"
                type="number"
                min="1"
                aria-invalid={!!errors.estimatedMinutes}
                {...register("estimatedMinutes")}
              />
              {errors.estimatedMinutes && (
                <p className="text-sm text-destructive">
                  {errors.estimatedMinutes.message}
                </p>
              )}
            </div>

            <SelectField
              name="topicId"
              label="Topic"
              control={control}
              error={errors.topicId?.message}
              placeholder={topicsLoading ? "Loading topics..." : "Select topic"}
              options={topics.map((topic) => topic.id)}
              optionLabels={topics.map((topic) => topic.name)}
              disabled={topicsLoading}
            />
          </div>

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

function SelectField({
  name,
  label,
  control,
  error,
  placeholder,
  options,
  optionLabels,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={option} value={option}>
                  {optionLabels?.[index] ?? option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
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
            aria-label={`Deactivate ${label}`}
          >
            <Archive className="size-4" />
          </button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {label}?</AlertDialogTitle>

          <AlertDialogDescription>
            The {label} will be hidden from public listings. You can restore it
            at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}