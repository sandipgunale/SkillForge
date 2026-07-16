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

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SubmitDialog({ answered, total, onSubmit, loading }) {
  return (
    <AlertDialog>
      {/* Trigger */}
      <AlertDialogTrigger
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          `Submit Quiz (${answered}/${total})`
        )}
      </AlertDialogTrigger>

      {/* Dialog */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>

          <AlertDialogDescription>
            You answered <strong>{answered}</strong> out of{" "}
            <strong>{total}</strong> questions.
            <br />
            <br />
            <strong>{total - answered}</strong> question(s) are still
            unanswered.
            <br />
            If you submit now, unanswered questions will be marked incorrect.
          </AlertDialogDescription>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <Progress
              value={(answered / total) * 100}
              className={answered === total ? "[&>div]:bg-green-500" : ""}
            />

            <p className="text-center text-sm text-muted-foreground">
              {answered} of {total} questions answered
            </p>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Continue Quiz</AlertDialogCancel>

          <AlertDialogAction disabled={loading} onClick={onSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
