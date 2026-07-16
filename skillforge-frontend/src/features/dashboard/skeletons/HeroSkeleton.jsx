import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSkeleton() {
  return (
    <div className="rounded-xl border p-8 space-y-4">
      <Skeleton className="h-10 w-64" />

      <Skeleton className="h-4 w-96" />

      <div className="flex gap-4 pt-4">
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
      </div>
    </div>
  );
}
