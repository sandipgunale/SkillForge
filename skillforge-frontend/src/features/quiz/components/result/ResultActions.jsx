import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ResultActions() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-4">
      <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
        Dashboard
      </Button>

      <Button onClick={() => navigate(ROUTES.QUIZ_SETUP)}>Retake Quiz</Button>
    </div>
  );
}
