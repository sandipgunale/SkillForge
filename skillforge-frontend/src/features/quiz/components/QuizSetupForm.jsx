import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { quizSetupSchema } from "../schemas/quizSetup.schema";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz";
import { useTopics } from "@/features/resources/hooks/useTopics";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

export default function QuizSetupForm() {
  const { data: topics = [] } = useTopics();

  const generateQuiz = useGenerateQuiz();

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(quizSetupSchema),

    defaultValues: {
      topicId: "",
      difficulty: "BEGINNER",
      questionCount: 10,
      questionTypes: ["MCQ"],
    },
  });

  const onSubmit = (values) => {
    generateQuiz.mutate(values);
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-6 p-6">
        {/* Topic */}

        <div className="space-y-2">
          <Label>Topic</Label>

          <select
            className="w-full rounded-md border p-2"
            {...register("topicId")}
          >
            <option value="">Select Topic</option>

            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}

        <div className="space-y-2">
          <Label>Difficulty</Label>

          <select
            className="w-full rounded-md border p-2"
            {...register("difficulty")}
          >
            <option value="BEGINNER">Beginner</option>

            <option value="INTERMEDIATE">Intermediate</option>

            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* Questions */}

        <div className="space-y-2">
          <Label>Question Count</Label>

          <Input
            type="number"
            min={1}
            max={20}
            {...register("questionCount", {
              valueAsNumber: true,
            })}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit(onSubmit)}
          disabled={generateQuiz.isPending}
        >
          {generateQuiz.isPending ? "Generating..." : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}
