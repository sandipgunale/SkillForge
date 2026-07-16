import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorFallback({ error, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow">
        <AlertTriangle className="mx-auto mb-6 h-14 w-14 text-destructive" />

        <h1 className="text-3xl font-bold">Something went wrong</h1>

        <p className="mt-4 text-muted-foreground">
          An unexpected error occurred while rendering this page.
        </p>

        {import.meta.env.DEV && error && (
          <pre className="mt-6 overflow-auto rounded bg-muted p-4 text-left text-xs">
            {error.toString()}
          </pre>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={onRetry}>Try Again</Button>

          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
