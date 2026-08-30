import OptionList from "../../components/OptionList";

export default function MCQQuestion({ question, selectedAnswer, onAnswer }) {
  return (
    <div className="space-y-5">
      <p className="text-lg font-medium leading-relaxed text-foreground">
        {question.content}
      </p>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Select one answer
      </p>

      <OptionList
        options={question.options ?? []}
        selected={selectedAnswer}
        onSelect={onAnswer}
      />
    </div>
  );
}
