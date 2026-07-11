import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border py-12">
      <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-center text-muted-foreground">{description}</p>

      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
