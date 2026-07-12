import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-1/2" />

      <Skeleton className="h-6 w-1/4" />

      <Skeleton className="aspect-video w-full rounded-xl" />

      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
