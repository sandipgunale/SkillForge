import { Skeleton } from "@/components/ui/skeleton";

export default function LearningPathSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-2/3" />

          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}
