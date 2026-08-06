import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import ErrorState from "@/components/common/ErrorState";

import { useResources } from "@/features/resources/hooks/useResources";
import { resourcesService } from "@/features/resources/api/resourcesService";
import { QUERY_KEYS } from "@/constants/queryKeys";

import ResourceFormDialog from "./ResourceFormDialog";

const PAGE_SIZE = 12;

export default function ResourceManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useResources({
    search,
    page,
    size: PAGE_SIZE,
  });

  const deleteMutation = useMutation({
    mutationFn: (resourceId) => resourcesService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES });
      toast.success("Resource deleted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? "Failed to delete resource.");
    },
  });

  const resources = data?.resources ?? [];

  const header = useMemo(() => {
    if (isLoading && !data) {
      return <ResourceTableSkeleton />;
    }

    if (isError) {
      return <ErrorState onRetry={refetch} />;
    }

    if (resources.length === 0) {
      return (
        <p className="py-10 text-center text-muted-foreground">
          No resources found.
        </p>
      );
    }

    return (
      <div className="grid gap-3">
        {resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            onDelete={() => deleteMutation.mutate(resource.id)}
            deleting={deleteMutation.isPending}
          />
        ))}

        {(data?.totalPages ?? 0) > 1 && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= (data?.totalPages ?? 0) - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    data,
    isLoading,
    isError,
    refetch,
    resources,
    deleteMutation,
    page,
  ]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search resources..."
            aria-label="Search resources"
            className="pl-9"
          />
        </div>

        <ResourceFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New resource
            </Button>
          }
        />
      </div>

      {header}
    </section>
  );
}

function ResourceRow({ resource, onDelete, deleting }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{resource.title}</p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {resource.type?.toLowerCase()}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {resource.difficulty?.toLowerCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {resource.topicName ?? "No topic"}
            </span>
            {resource.estimatedMinutes ? (
              <span className="text-xs text-muted-foreground">
                · {resource.estimatedMinutes} min
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ResourceFormDialog
            resource={resource}
            trigger={
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                aria-label={`Edit ${resource.title}`}
              >
                <Pencil className="size-4" />
              </button>
            }
          />

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  aria-label={`Delete ${resource.title}`}
                  disabled={deleting}
                >
                  <Trash2 className="size-4" />
                </button>
              }
            />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete resource?</AlertDialogTitle>

                <AlertDialogDescription>
                  &quot;{resource.title}&quot; will be removed permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
