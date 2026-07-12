import { Card, CardContent } from "@/components/ui/card";

import OptionList from "./OptionList";

import { useMemo } from "react";

export default function QuestionCard({ question, selectedAnswer, onAnswer }) {
  const options = useMemo(
    () => JSON.parse(question.optionsJson),
    [question.optionsJson],
  );

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-semibold">{question.content}</h2>

        <OptionList
          options={options}
          selected={selectedAnswer}
          onSelect={onAnswer}
        />
      </CardContent>
    </Card>
  );
}
