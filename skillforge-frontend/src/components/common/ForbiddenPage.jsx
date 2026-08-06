import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <LockKeyhole className="size-8" />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">403 — Access denied</h1>

        <p className="mt-2 max-w-md text-muted-foreground">
          You don&apos;t have permission to view this workspace. If you believe
          this is a mistake, contact an administrator.
        </p>
      </div>

      <div className="mt-2 flex gap-3">
        <Button asChild>
          <Link to={ROUTES.DASHBOARD}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
