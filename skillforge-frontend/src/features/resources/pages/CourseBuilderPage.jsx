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
  GraduationCap,
  Layers,
  Link as LinkIcon,
  Pencil,
  Plus,
  PlayCircle,
  Sparkles,
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
import { useCourseCurriculum } from "../hooks/useCourseCurriculum";
import {
  useCreateLesson,
  useCreateSection,
  useDeleteLesson,
  useDeleteSection,
  useReorderSections,
  useUpdateLesson,
  useUpdateSection,
} from "../hooks/useCourseSections";
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

const lessonSchema = z.object({
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

const sectionSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  description: z.string().trim().max(2000).optional(),
});

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    data: resource,
    isLoading: resourceLoading,
    isError: resourceError,
    refetch: refetchResource,
  } = useResource(courseId);

  const {
    data: curriculum,
    isLoading: curriculumLoading,
    isError: curriculumError,
    refetch: refetchCurriculum,
  } = useCourseCurriculum(courseId);

  const createSection = useCreateSection(courseId);
  const updateSection = useUpdateSection(courseId);
  const deleteSection = useDeleteSection(courseId);
  const reorderSections = useReorderSections(courseId);
  const createLesson = useCreateLesson(courseId);
  const updateLesson = useUpdateLesson(courseId);
  const deleteLesson = useDeleteLesson(courseId);

  const [sectionDialog, setSectionDialog] = useState({ open: false, editing: null });
  const [lessonDialog, setLessonDialog] = useState({
    open: false,
    editing: null,
    defaultSectionId: "",
  });

  const openCreateSection = () =>
    setSectionDialog({ open: true, editing: null });
  const openEditSection = (section) =>
    setSectionDialog({ open: true, editing: section });
  const openCreateLesson = (defaultSectionId = "") =>
    setLessonDialog({ open: true, editing: null, defaultSectionId });
  const openEditLesson = (lesson) =>
    setLessonDialog({
      open: true,
      editing: lesson,
      defaultSectionId: lesson.sectionId ?? "",
    });

  const sections = curriculum?.sections ?? [];
  const uncategorized = curriculum?.uncategorizedLessons ?? [];

  const moveSection = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    reorderSections.mutate(reordered.map((entry) => entry.section.id));
  };

  const moveLesson = (lessons, index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= lessons.length) return;
    const a = lessons[index];
    const b = lessons[next];
    updateLesson.mutate({ lessonId: a.id, payload: { orderIndex: b.orderIndex } });
    updateLesson.mutate({ lessonId: b.id, payload: { orderIndex: a.orderIndex } });
  };

  const isPending =
    createSection.isPending ||
    updateSection.isPending ||
    deleteSection.isPending ||
    reorderSections.isPending ||
    createLesson.isPending ||
    updateLesson.isPending ||
    deleteLesson.isPending;

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
            <GraduationCap className="size-4" />
            Course Builder
          </div>
          {resourceLoading ? (
            <Skeleton className="h-8 w-64 rounded-lg" />
          ) : (
            <PageHeader
              title={resource?.title ?? "Course"}
              description={
                resource
                  ? "Compose sections and lessons learners progress through."
                  : ""
              }
            />
          )}
        </div>

        <Button onClick={openCreateSection} disabled={isPending}>
          <Plus className="size-4" />
          Add section
        </Button>
      </div>

      {resourceError ? (
        <ErrorState onRetry={refetchResource} />
      ) : curriculumError ? (
        <ErrorState onRetry={refetchCurriculum} />
      ) : curriculumLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : sections.length === 0 && uncategorized.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
          <Layers className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No sections yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a section, then drop lessons (videos, articles, exercises) inside it.
          </p>
          <Button className="mt-4" onClick={openCreateSection}>
            <Plus className="size-4" />
            Add your first section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((entry, sectionIndex) => {
            const section = entry.section;
            const lessons = entry.lessons ?? [];
            return (
              <section
                key={section.id}
                className="rounded-2xl border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(sectionIndex, -1)}
                      disabled={sectionIndex === 0 || isPending}
                      aria-label="Move section up"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(sectionIndex, 1)}
                      disabled={sectionIndex === sections.length - 1 || isPending}
                      aria-label="Move section down"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditSection(section)}
                      aria-label={`Edit section ${section.title}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <ConfirmDelete
                      onConfirm={() => deleteSection.mutate(section.id)}
                      label="section"
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {lessons.length === 0 ? (
                    <p className="rounded-lg border border-dashed px-3 py-3 text-center text-xs text-muted-foreground">
                      No lessons in this section yet.
                    </p>
                  ) : (
                    lessons.map((lesson, lessonIndex) => {
                      const meta = CONTENT_TYPE_META[lesson.type] ?? {
                        icon: FileText,
                        label: lesson.type,
                      };
                      const Icon = meta.icon;
                      return (
                        <div
                          key={lesson.id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {lesson.title}
                              </p>
                              {lesson.required ? (
                                <Badge variant="secondary" className="shrink-0">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="shrink-0">
                                  Optional
                                </Badge>
                              )}
                              {lesson.freePreview && (
                                <Badge variant="outline" className="shrink-0 text-ember">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {meta.label}
                              {lesson.durationMinutes
                                ? ` · ${lesson.durationMinutes} min`
                                : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                moveLesson(lessons, lessonIndex, -1)
                              }
                              disabled={lessonIndex === 0 || isPending}
                              aria-label="Move lesson up"
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                            >
                              <ArrowUp className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLesson(lessons, lessonIndex, 1)}
                              disabled={
                                lessonIndex === lessons.length - 1 || isPending
                              }
                              aria-label="Move lesson down"
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                            >
                              <ArrowDown className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditLesson(lesson)}
                              aria-label={`Edit lesson ${lesson.title}`}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <ConfirmDelete
                              onConfirm={() => deleteLesson.mutate(lesson.id)}
                              label="lesson"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCreateLesson(section.id)}
                    disabled={isPending}
                  >
                    <Plus className="size-3.5" />
                    Add lesson
                  </Button>
                </div>
              </section>
            );
          })}

          {uncategorized.length > 0 && (
            <section className="rounded-2xl border border-dashed bg-card p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Uncategorized lessons
              </h3>
              <div className="mt-3 space-y-2">
                  {uncategorized.map((lesson) => {
                  const meta = CONTENT_TYPE_META[lesson.type] ?? {
                    icon: FileText,
                    label: lesson.type,
                  };
                  const Icon = meta.icon;
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {lesson.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {meta.label}
                          {lesson.durationMinutes
                            ? ` · ${lesson.durationMinutes} min`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditLesson(lesson)}
                          aria-label={`Edit lesson ${lesson.title}`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <ConfirmDelete
                          onConfirm={() => deleteLesson.mutate(lesson.id)}
                          label="lesson"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openCreateLesson("")}
                  disabled={isPending}
                >
                  <Plus className="size-3.5" />
                  Add lesson
                </Button>
              </div>
            </section>
          )}
        </div>
      )}

      <SectionFormDialog
        open={sectionDialog.open}
        onOpenChange={(open) => setSectionDialog({ open, editing: null })}
        editing={sectionDialog.editing}
        onCreate={(payload) =>
          createSection.mutate(payload, {
            onSuccess: () => setSectionDialog({ open: false, editing: null }),
          })
        }
        onUpdate={(payload) =>
          updateSection.mutate(
            { sectionId: sectionDialog.editing.id, payload },
            { onSuccess: () => setSectionDialog({ open: false, editing: null }) },
          )
        }
        isPending={isPending}
      />

      <LessonFormDialog
        open={lessonDialog.open}
        onOpenChange={(open) =>
          setLessonDialog({ open, editing: null, defaultSectionId: "" })
        }
        editing={lessonDialog.editing}
        defaultSectionId={lessonDialog.defaultSectionId}
        sections={sections}
        onCreate={(payload) =>
          createLesson.mutate(payload, {
            onSuccess: () =>
              setLessonDialog({ open: false, editing: null, defaultSectionId: "" }),
          })
        }
        onUpdate={(payload) =>
          updateLesson.mutate(
            { lessonId: lessonDialog.editing.id, payload },
            {
              onSuccess: () =>
                setLessonDialog({
                  open: false,
                  editing: null,
                  defaultSectionId: "",
                }),
            },
          )
        }
        isPending={isPending}
      />
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Section form                                */
/* -------------------------------------------------------------------------- */

function SectionFormDialog({
  open,
  onOpenChange,
  editing,
  onCreate,
  onUpdate,
  isPending,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: editing?.title ?? "", description: editing?.description ?? "" },
  });

  const [lastEditingId, setLastEditingId] = useState(editing?.id ?? null);
  if ((editing?.id ?? null) !== lastEditingId) {
    setLastEditingId(editing?.id ?? null);
    reset({
      title: editing?.title ?? "",
      description: editing?.description ?? "",
    });
  }

  const submit = (values) => {
    const payload = {
      title: values.title,
      description: values.description || null,
    };
    if (editing) onUpdate(payload);
    else onCreate(payload);
  };

  const isEditing = Boolean(editing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            Group related lessons under a themed section.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              placeholder="e.g. Getting Started"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Description</Label>
            <Textarea
              id="section-description"
              placeholder="Optional summary of this section."
              rows={3}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          </div>

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
/*                                Lesson form                                 */
/* -------------------------------------------------------------------------- */

function LessonFormDialog({
  open,
  onOpenChange,
  editing,
  defaultSectionId,
  sections,
  onCreate,
  onUpdate,
  isPending,
}) {
  const [required, setRequired] = useState(editing?.required ?? true);
  const [freePreview, setFreePreview] = useState(editing?.freePreview ?? false);
  const [sectionId, setSectionId] = useState(
    editing?.sectionId ?? defaultSectionId ?? "",
  );
  const [materials, setMaterials] = useState(editing?.materials ?? []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
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
    setFreePreview(editing?.freePreview ?? false);
    setSectionId(editing?.sectionId ?? defaultSectionId ?? "");
    setMaterials(editing?.materials ?? []);
  }

  const type = watch("type");
  const url = watch("url");
  const embed = type === "VIDEO" && url ? getYoutubeEmbedUrl(url) : "";

  const submit = (values) => {
    const cleanMaterials = (materials ?? [])
      .filter((material) => material?.title?.trim() || material?.url?.trim())
      .map((material) => ({
        title: material.title?.trim() || "Resource",
        url: material.url?.trim() || "#",
      }));

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
      sectionId: sectionId || null,
      freePreview,
      materials: cleanMaterials,
    };

    if (editing) onUpdate(payload);
    else onCreate(payload);
  };

  const isEditing = Boolean(editing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit lesson" : "Add lesson"}</DialogTitle>
          <DialogDescription>
            Lessons become steps learners complete inside the course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
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
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
              <Label htmlFor="lesson-duration">Duration (min)</Label>
              <Input
                id="lesson-duration"
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
            <Label htmlFor="lesson-url">URL</Label>
            <Input
              id="lesson-url"
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
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              placeholder="What will learners do or learn here?"
              rows={3}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={sectionId ?? ""} onValueChange={setSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Uncategorized" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uncategorized</SelectItem>
                  {sections.map((entry) => (
                    <SelectItem key={entry.section.id} value={entry.section.id}>
                      {entry.section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-author">Author</Label>
              <Input
                id="lesson-author"
                placeholder="Optional"
                {...register("author")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-isbn">ISBN</Label>
            <Input
              id="lesson-isbn"
              placeholder="For books"
              {...register("isbn")}
            />
          </div>

          <MaterialsEditor value={materials} onChange={setMaterials} />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
              className="size-4 accent-ember"
            />
            Required for completion
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={freePreview}
              onChange={(event) => setFreePreview(event.target.checked)}
              className="size-4 accent-ember"
            />
            Free preview (visible before enrolling)
          </label>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEditing ? "Save changes" : "Add lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Materials editor                              */
/* -------------------------------------------------------------------------- */

function MaterialsEditor({ value, onChange }) {
  const update = (index, field, val) =>
    onChange(value.map((material, i) => (i === index ? { ...material, [field]: val } : material)));
  const add = () => onChange([...(value ?? []), { title: "", url: "" }]);
  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4 text-ember" />
        Related Materials
      </div>
      {(value ?? []).map((material, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Title"
            value={material.title ?? ""}
            onChange={(event) => update(index, "title", event.target.value)}
          />
          <Input
            placeholder="https://..."
            value={material.url ?? ""}
            onChange={(event) => update(index, "url", event.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label="Remove material"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="size-3.5" />
        Add material
      </Button>
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
            This cannot be undone. Learners will lose access to this {label}.
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
