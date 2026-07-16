import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AppError() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <AlertTriangle className="h-20 w-20 text-red-500" />

      <div className="text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>

        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred while loading this page.
        </p>
      </div>

      <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
    </div>
  );
}
