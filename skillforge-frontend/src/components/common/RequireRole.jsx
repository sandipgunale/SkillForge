import { useAuth } from "@/store/authStore";
import ForbiddenPage from "./ForbiddenPage";

export default function RequireRole({ role, children }) {
  const { role: userRole } = useAuth();

  if (userRole !== role) {
    return <ForbiddenPage />;
  }

  return children;
}
