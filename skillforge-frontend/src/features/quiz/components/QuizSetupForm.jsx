import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { quizSetupSchema } from "../schemas/quizSetup.schema";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz";
import { useTopics } from "@/features/resources/hooks/useTopics";
import { useLearningPaths } from "@/features/learning-path/hooks/useLearningPaths";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuizSetupForm() {
  const { data: topics = [] } = useTopics();

  const { data: learningPaths = [] } = useLearningPaths();

  const generateQuiz = useGenerateQuiz();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quizSetupSchema),

    defaultValues: {
      source: "TOPIC",
      topicId: "",
      learningPathId: "",
      weekNumber: 1,
      difficulty: "BEGINNER",
      questionCount: 10,
      questionTypes: ["MCQ"],
    },
  });

  const source = watch("source");

  const questionCount = watch("questionCount") || 10;

  const questionTypes = watch("questionTypes") || [];

  const selectedLearningPathId = watch("learningPathId");

  const selectedLearningPath = learningPaths.find(
    (path) => path.id === selectedLearningPathId,
  );

  const estimatedMinutes = Math.ceil(questionCount * 1.5);

  const onSubmit = (values) => {
    const payload = {
      source: values.source,
      difficulty: values.difficulty,
      questionCount: values.questionCount,
      questionTypes: values.questionTypes,
    };

    if (values.source === "TOPIC") {
      payload.topicId = values.topicId;
    } else {
      payload.learningPathId = values.learningPathId;

      payload.weekNumber = values.weekNumber;
    }

    generateQuiz.mutate(payload);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="space-y-6 p-6">
        {/* Quiz Source */}

        <div className="space-y-3">
          <Label>Quiz Source</Label>

          <RadioGroup
            value={source}
            onValueChange={(value) => setValue("source", value)}
            className="flex gap-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TOPIC" id="topic" />

              <Label htmlFor="topic">Topic Quiz</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LEARNING_PATH" id="learning-path" />

              <Label htmlFor="learning-path">Learning Path Quiz</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Topic */}

        {source === "TOPIC" && (
          <div className="space-y-2">
            <Label>Topic</Label>

            <Controller
              control={control}
              name="topicId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>

                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.topicId && (
              <p className="text-sm text-red-500">{errors.topicId.message}</p>
            )}
          </div>
        )}

        {/* Learning Path */}

        {source === "LEARNING_PATH" && (
          <div className="space-y-2">
            <Label>Learning Path</Label>

            <Controller
              control={control}
              name="learningPathId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Learning Path" />
                  </SelectTrigger>

                  <SelectContent>
                    {learningPaths.map((path) => (
                      <SelectItem key={path.id} value={path.id}>
                        {path.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.learningPathId && (
              <p className="text-sm text-red-500">
                {errors.learningPathId.message}
              </p>
            )}
          </div>
        )}

        {/* Week */}

        {source === "LEARNING_PATH" && selectedLearningPath && (
          <div className="space-y-2">
            <Label>Week</Label>

            <Controller
              control={control}
              name="weekNumber"
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Week" />
                  </SelectTrigger>

                  <SelectContent>
                    {Array.from(
                      {
                        length: selectedLearningPath.durationWeeks,
                      },
                      (_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          Week {index + 1}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.weekNumber && (
              <p className="text-sm text-red-500">
                {errors.weekNumber.message}
              </p>
            )}
          </div>
        )}

        {/* Difficulty */}

        <div className="space-y-2">
          <Label>Difficulty</Label>

          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>

                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>

                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Question Count */}

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

        {/* Estimated Time */}

        <Card className="bg-muted/40 border-dashed">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Estimated Time</p>

              <p className="text-xs text-muted-foreground">
                Based on selected question count
              </p>
            </div>

            <div className="text-lg font-bold">≈ {estimatedMinutes} min</div>
          </CardContent>
        </Card>

        {/* Question Types */}

        <div className="space-y-3">
          <Label>Question Types</Label>

          <ToggleGroup
            type="multiple"
            value={questionTypes}
            onValueChange={(value) => {
              if (value.length > 0) {
                setValue("questionTypes", value, {
                  shouldValidate: true,
                });
              }
            }}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem value="MCQ">MCQ</ToggleGroupItem>

            <ToggleGroupItem value="CODING">Coding</ToggleGroupItem>

            <ToggleGroupItem value="INTERVIEW">Interview</ToggleGroupItem>

            <ToggleGroupItem value="SCENARIO">Scenario</ToggleGroupItem>
          </ToggleGroup>

          {errors.questionTypes && (
            <p className="text-sm text-red-500">
              {errors.questionTypes.message}
            </p>
          )}
        </div>

        {/* Submit */}

        <Button
          type="button"
          className="w-full"
          onClick={handleSubmit(onSubmit)}
          disabled={generateQuiz.isPending}
        >
          {generateQuiz.isPending ? "Generating Quiz..." : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}
