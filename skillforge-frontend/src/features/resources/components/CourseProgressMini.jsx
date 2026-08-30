export default function CourseProgressMini({ progress }) {
  if (!progress) return null;
  const percentage = progress.completionPercentage ?? 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Course progress</span>
        <span>
          {progress.completedRequiredLessons ?? 0}/
          {progress.totalRequiredLessons ?? progress.totalLessons ?? 0} · {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ember to-aurora transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
