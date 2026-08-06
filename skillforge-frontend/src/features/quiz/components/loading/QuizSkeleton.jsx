import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function QuizSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-1/3" />

        <Skeleton className="h-10 w-28" />
      </div>

      <Skeleton className="h-3 w-full" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 p-6">
              <Skeleton className="h-6 w-2/3" />

              <Skeleton className="h-24 w-full" />

              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />

                <Skeleton className="h-12 w-full" />

                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-28" />

            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-1/2" />

            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function QuizResultSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Skeleton className="size-14 rounded-full" />

          <Skeleton className="h-10 w-40" />

          <Skeleton className="h-16 w-32" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-1/2" />

              <Skeleton className="h-4 w-full" />

              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
