import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { resourcesService } from "@/features/resources/api/resourcesService";
import { useTopicsList, useTagsList } from "@/features/admin/hooks/useCatalog";
import { QUERY_KEYS } from "@/constants/queryKeys";

const RESOURCE_TYPES = ["VIDEO", "ARTICLE", "COURSE", "DOCS", "BOOK"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const resourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().min(1, "Description is required.").max(1000),
  url: z
    .string()
    .trim()
    .min(1, "URL is required.")
    .refine((value) => /^https?:\/\//.test(value), "Must be a valid http(s) URL."),
  type: z.enum(["VIDEO", "ARTICLE", "COURSE", "DOCS", "BOOK"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedMinutes: z.coerce
    .number({ invalid_type_error: "Required." })
    .positive("Must be greater than zero."),
  topicId: z.string().min(1, "Topic is required."),
  tagIds: z.array(z.string()).default([]),
});

const buildDefaults = (resource, tags = []) => {
  const idByTagName = Object.fromEntries(tags.map((tag) => [tag.name, tag.id]));

  return {
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    url: resource?.url ?? "",
    type: resource?.type ?? "ARTICLE",
    difficulty: resource?.difficulty ?? "BEGINNER",
    estimatedMinutes: resource?.estimatedMinutes ?? 10,
    topicId: resource?.topicId ?? "",
    tagIds: (resource?.tags ?? [])
      .map((name) => idByTagName[name])
      .filter(Boolean),
  };
};

export default function ResourceFormDialog({ resource = null, trigger }) {
  const [open, setOpen] = useState(false);

  const { data: topics = [] } = useTopicsList();
  const { data: tags = [] } = useTagsList();

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: buildDefaults(resource, tags),
  });

  const handleOpenChange = (next) => {
    if (next) {
      reset(buildDefaults(resource, tags));
    }

    setOpen(next);
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      resource
        ? resourcesService.updateResource(resource.id, payload)
        : resourcesService.createResource(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success(resource ? "Resource updated" : "Resource created");
      reset(buildDefaults(resource, tags));
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? "Failed to save resource.");
    },
  });

  const selectedTagIds = watch("tagIds");

  const toggleTag = (tagId) => {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    setValue("tagIds", next, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {resource ? "Edit resource" : "New resource"}
          </DialogTitle>

          <DialogDescription>
            Resources are visible to all learners immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              placeholder="e.g. Getting Started with React"
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
              placeholder="What will learners get from this?"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value, { shouldValidate: true })}
              >
                <SelectTrigger id="resource-type" className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-difficulty">Difficulty</Label>
              <Select
                value={watch("difficulty")}
                onValueChange={(value) => setValue("difficulty", value, { shouldValidate: true })}
              >
                <SelectTrigger id="resource-difficulty" className="w-full">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-minutes">Estimated minutes</Label>
              <Input
                id="resource-minutes"
                type="number"
                min={1}
                aria-invalid={!!errors.estimatedMinutes}
                {...register("estimatedMinutes")}
              />
              {errors.estimatedMinutes && (
                <p className="text-sm text-destructive">
                  {errors.estimatedMinutes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-topic">Topic</Label>
              <Select
                value={watch("topicId")}
                onValueChange={(value) => setValue("topicId", value, { shouldValidate: true })}
              >
                <SelectTrigger id="resource-topic" className="w-full">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topicId && (
                <p className="text-sm text-destructive">
                  {errors.topicId.message}
                </p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm transition-colors has-data-checked:border-primary has-data-checked:bg-primary/10"
                  >
                    <Checkbox
                      checked={selectedTagIds.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                      className="size-4"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving..."
                : resource
                  ? "Save changes"
                  : "Create resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
