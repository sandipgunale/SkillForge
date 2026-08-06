import QuizTimer from "./QuizTimer";

export default function QuizHeader({ topic, onTimeout }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Quiz · {topic}
        </p>

        <h1 className="display mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
          {topic}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Stay in the loop — answer every question carefully.
        </p>
      </div>

      <QuizTimer onTimeout={onTimeout} />
    </div>
  );
}