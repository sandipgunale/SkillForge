import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";

import OptionList from "./OptionList";

export default function QuestionCard({ question, selectedAnswer, onAnswer }) {
  const options = useMemo(() => {
    if (!question?.optionsJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(question.optionsJson);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse question options:", error);

      return [];
    }
  }, [question?.optionsJson]);

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-semibold leading-8">{question.content}</h2>

        {options.length > 0 ? (
          <OptionList
            options={options}
            selected={selectedAnswer}
            onSelect={onAnswer}
          />
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No answer options are available for this question.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
