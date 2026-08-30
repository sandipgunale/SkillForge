import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Spinner from "@/components/common/Spinner";

export default function SubmitDialog({ answered, total, onSubmit, loading }) {
  const unanswered = Math.max(total - answered, 0);
  const allAnswered = unanswered === 0;
  const percent = total > 0 ? (answered / total) * 100 : 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 size-4" />
            Submitting...
          </>
        ) : (
          `Submit Quiz (${answered}/${total})`
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>

          <AlertDialogDescription>
            You&apos;ve completed <strong>{answered}</strong> of{" "}
            <strong>{total}</strong> questions.
          </AlertDialogDescription>

          <div className="space-y-4">
            {allAnswered ? (
              <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-sm font-medium text-success">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                All questions answered
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm font-medium text-warning">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {unanswered} question{unanswered === 1 ? "" : "s"} remain
                unanswered. They will be marked incorrect if you submit now.
              </div>
            )}

            <div className="space-y-2">
              <Progress
                value={percent}
                className={
                  allAnswered ? "[&>div]:bg-success" : "[&>div]:bg-warning"
                }
              />
              <p className="text-center text-xs text-muted-foreground">
                {Math.round(percent)}% complete
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Continue Quiz</AlertDialogCancel>

          <AlertDialogAction disabled={loading} onClick={onSubmit}>
            {loading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Submitting...
              </>
            ) : (
              "Submit Quiz →"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
