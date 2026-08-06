import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Sparkles, Clock } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export default function FinalAssessmentCard({ learningPathId }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(ROUTES.QUIZ_SETUP, {
      state: {
        source: "LEARNING_PATH",
        learningPathId,
      },
    });
  };

  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
            <Sparkles className="h-5 w-5 text-success" />
          </div>

          <div>
            <p className="font-semibold">Final Assessment</p>

            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Complete one comprehensive AI-generated quiz to finish your
              learning path.
            </p>
          </div>
        </div>

        <Button onClick={handleStart} className="shrink-0">
          Start Final Assessment
        </Button>
      </CardContent>
    </Card>
  );
}
