import OptionList from "../../components/OptionList";

export default function MCQQuestion({ question, selectedAnswer, onAnswer }) {
  return (
    <OptionList
      options={question.options ?? []}
      selected={selectedAnswer}
      onSelect={onAnswer}
    />
  );
}
