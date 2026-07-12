import { Button } from "@/components/ui/button";

import SubmitDialog from "./SubmitDialog";

export default function QuizNavigation({
  current,
  total,
  answered,
  previous,
  next,
  submit,
  loading,
}) {
  return (
    <div className="flex justify-between">
      <Button variant="outline" disabled={current === 0} onClick={previous}>
        Previous
      </Button>

      {current === total - 1 ? (
        <SubmitDialog
          answered={answered}
          total={total}
          onSubmit={submit}
          loading={loading}
        />
      ) : (
        <Button onClick={next}>Next</Button>
      )}
    </div>
  );
}
