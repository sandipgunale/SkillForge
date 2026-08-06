import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export default function RouteFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-8xl font-bold text-primary">404</h1>

      <p className="mt-4 text-lg text-muted-foreground">Page Not Found</p>

      <Link
        to={ROUTES.HOME}
        className="mt-8 rounded-lg bg-primary px-5 py-3 text-primary-foreground transition hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
