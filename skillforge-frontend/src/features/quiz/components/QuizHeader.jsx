import QuizTimer from "./QuizTimer";

export default function QuizHeader({ topic, onTimeout }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{topic} Quiz</h1>

        <p className="text-sm text-muted-foreground">
          Answer every question carefully.
        </p>
      </div>

      <QuizTimer onTimeout={onTimeout} />
    </div>
  );
}
