import AppCard from "@/components/common/AppCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceCardSkeleton() {
  return (
    <AppCard className="overflow-hidden">
      <div className="space-y-5 p-5">
        {/* Header */}

        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />

          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Title */}

        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5" />

          <Skeleton className="h-6 w-2/3" />
        </div>

        {/* Description */}

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-5/6" />

          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Tags */}

        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />

          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />

          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </AppCard>
  );
}
