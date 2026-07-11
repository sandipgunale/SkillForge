import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export default function RouteFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100">
      <h1 className="text-8xl font-bold text-blue-600">404</h1>

      <p className="mt-4 text-lg text-gray-600">Page Not Found</p>

      <Link
        to={ROUTES.HOME}
        className="mt-8 rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}
