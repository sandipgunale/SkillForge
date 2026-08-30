import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Code2,
  HelpCircle,
  FileText,
  Target,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { quizSetupSchema } from "../schemas/quizSetup.schema";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz";
import { getQuizDurationSeconds } from "../constants/quiz.constants";
import { useTopics } from "@/features/resources/hooks/useTopics";
import { useLearningPaths } from "@/features/learning-path/hooks/useLearningPaths";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuizSetupForm({ preselection = {} }) {
  const { data: topics = [] } = useTopics();
  const { data: learningPaths = [] } = useLearningPaths();
  const generateQuiz = useGenerateQuiz();
  const [formError, setFormError] = useState(null);

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
      source: preselection.source ?? "TOPIC",
      topicId: preselection.topicId ?? "",
      learningPathId: preselection.learningPathId ?? "",
      weekNumber: preselection.weekNumber ?? 1,
      difficulty: "BEGINNER",
      questionCount: 10,
      questionTypes: ["MCQ"],
    },
  });

  const source = watch("source");
  const questionCount = watch("questionCount") || 10;
  const questionTypes = watch("questionTypes") || [];
  const selectedTopicId = watch("topicId");
  const selectedLearningPathId = watch("learningPathId");
  const difficulty = watch("difficulty");
  const weekNumber = watch("weekNumber");

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);
  const selectedLearningPath = learningPaths.find(
    (path) => path.id === selectedLearningPathId,
  );

  const estimatedMinutes = Math.ceil(
    getQuizDurationSeconds(questionCount) / 60,
  );

  const onSubmit = (values) => {
    setFormError(null);
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

    if (preselection.lessonId) {
      payload.lessonId = preselection.lessonId;
    }

    generateQuiz.mutate(payload, {
      onError: (err) => {
        setFormError(
          err?.response?.data?.message ||
            "Your quiz couldn't be forged this time. Check your connection and try again.",
        );
      },
    });
  };

  // Question mix breakdown calculation
  const totalTypes = questionTypes.length || 1;
  const countPerType = Math.floor(questionCount / totalTypes);
  const remainder = questionCount % totalTypes;

  const questionTypeDetails = [
    { id: "MCQ", label: "MCQ", desc: "Core concepts & knowledge", icon: HelpCircle },
    { id: "CODING", label: "Coding", desc: "Hands-on code execution", icon: Code2 },
    { id: "INTERVIEW", label: "Interview", desc: "Deep technical explanation", icon: FileText },
    { id: "SCENARIO", label: "Scenario", desc: "Real-world problem solving", icon: Target },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Configuration Workspace (~7 cols) */}
      <div className="lg:col-span-7 space-y-8">
        {/* Source Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            1. Choose Challenge Source
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue("source", "TOPIC", { shouldValidate: true })}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 ${
                source === "TOPIC"
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`p-2 rounded-lg ${source === "TOPIC" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <BookOpen className="size-4" />
                </div>
                <div className={`size-4 rounded-full border flex items-center justify-center ${source === "TOPIC" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                  {source === "TOPIC" && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </div>
              <span className="font-semibold text-foreground text-sm">Topic Quiz</span>
              <span className="text-xs text-muted-foreground mt-0.5">Practice a focused skill or technology</span>
            </button>

            <button
              type="button"
              onClick={() => setValue("source", "LEARNING_PATH", { shouldValidate: true })}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 ${
                source === "LEARNING_PATH"
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`p-2 rounded-lg ${source === "LEARNING_PATH" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <GraduationCap className="size-4" />
                </div>
                <div className={`size-4 rounded-full border flex items-center justify-center ${source === "LEARNING_PATH" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                  {source === "LEARNING_PATH" && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </div>
              <span className="font-semibold text-foreground text-sm">Learning Path</span>
              <span className="text-xs text-muted-foreground mt-0.5">Test mastery of a structured curriculum week</span>
            </button>
          </div>
        </div>

        {/* Source Entity Selection */}
        <div className="space-y-4 p-5 rounded-xl border bg-card/50 backdrop-blur-xs">
          {source === "TOPIC" ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Select Topic
              </Label>
              <Controller
                control={control}
                name="topicId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Choose a topic to practice..." />
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
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.topicId.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Select Learning Path
                </Label>
                <Controller
                  control={control}
                  name="learningPathId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue("weekNumber", 1);
                      }}
                    >
                      <SelectTrigger className="h-11 bg-background">
                        <SelectValue placeholder="Choose a learning path..." />
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
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" /> {errors.learningPathId.message}
                  </p>
                )}
              </div>

              {selectedLearningPath && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Select Curriculum Week
                  </Label>
                  <Controller
                    control={control}
                    name="weekNumber"
                    render={({ field }) => (
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="h-11 bg-background">
                          <SelectValue placeholder="Select week..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: selectedLearningPath.durationWeeks },
                            (_, index) => (
                              <SelectItem key={index + 1} value={String(index + 1)}>
                                Week {index + 1} · Curriculum Focus
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.weekNumber && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.weekNumber.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            2. Calibration Level
          </Label>
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "BEGINNER", label: "Beginner", desc: "Foundations & recall" },
                  { id: "INTERMEDIATE", label: "Intermediate", desc: "Application & logic" },
                  { id: "ADVANCED", label: "Advanced", desc: "Mastery & edge cases" },
                ].map((level) => {
                  const isSelected = field.value === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => field.onChange(level.id)}
                      className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary"
                          : "border-border bg-card text-foreground hover:border-border/80 hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{level.label}</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">{level.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Question Count & Est Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              3. Challenge Length
            </Label>
            <span className="text-xs font-medium text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
              <Clock className="size-3" /> ≈ {estimatedMinutes} min duration
            </span>
          </div>

          <div className="flex items-center gap-3">
            {[5, 10, 15, 20].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("questionCount", preset, { shouldValidate: true })}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  questionCount === preset
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {preset} Qs
              </button>
            ))}
          </div>

          <div className="pt-1 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Or custom count (1–20):</span>
            <Input
              type="number"
              min={1}
              max={20}
              className="w-24 h-9 bg-background text-center font-semibold"
              {...register("questionCount", { valueAsNumber: true })}
            />
          </div>
          {errors.questionCount && (
            <p className="text-xs text-destructive">{errors.questionCount.message}</p>
          )}
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            4. Question Mix & Formats
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questionTypeDetails.map((type) => {
              const Icon = type.icon;
              const isSelected = questionTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    const next = isSelected
                      ? questionTypes.filter((t) => t !== type.id)
                      : [...questionTypes, type.id];
                    if (next.length > 0) {
                      setValue("questionTypes", next, { shouldValidate: true });
                    }
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">{type.label}</span>
                      <div className={`size-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                        {isSelected && <CheckCircle2 className="size-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.questionTypes && (
            <p className="text-xs text-destructive">{errors.questionTypes.message}</p>
          )}
        </div>
      </div>

      {/* Right Column: Live Summary / "YOUR FORGE" Panel (~5 cols, sticky) */}
      <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
        <Card className="glass-strong border-border/80 shadow-elevated relative overflow-hidden">
          {/* Subtle forge glow accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Live Preview
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Sliders className="size-3.5" /> Synchronized
              </span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-heading mt-1">
              Your Forge
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Source Display */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Target Source
              </p>
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {source === "TOPIC" ? (
                    <BookOpen className="size-4 text-primary shrink-0" />
                  ) : (
                    <GraduationCap className="size-4 text-primary shrink-0" />
                  )}
                  <span className="font-semibold text-foreground truncate text-sm">
                    {source === "TOPIC"
                      ? selectedTopic?.name || "Select a topic..."
                      : selectedLearningPath?.title || "Select learning path..."}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                  {source === "TOPIC" ? "Topic" : `Week ${weekNumber}`}
                </span>
              </div>
            </div>

            {/* Config Meta Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Challenge Level
                </p>
                <p className="font-bold text-foreground text-sm uppercase tracking-wide">
                  {difficulty}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Est. Duration
                </p>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> ≈ {estimatedMinutes} min
                </p>
              </div>
            </div>

            {/* Question Mix Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Question Mix ({questionCount} Total)
                </p>
                <span className="text-xs text-muted-foreground font-mono">
                  {questionTypes.length} format{questionTypes.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/50">
                {questionTypes.length === 0 ? (
                  <p className="text-xs text-destructive text-center py-2">
                    Please select at least one question type.
                  </p>
                ) : (
                  questionTypes.map((typeId, index) => {
                    const detail = questionTypeDetails.find((d) => d.id === typeId);
                    const qty = countPerType + (index < remainder ? 1 : 0);
                    return (
                      <div key={typeId} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                        <span className="font-medium text-foreground">{detail?.label || typeId}</span>
                        <span className="font-mono font-semibold text-primary">{qty} Q{qty === 1 ? "" : "s"}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Inline Error if any */}
            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {preselection.lessonId && (
              <div className="p-3 rounded-lg bg-aurora/10 border border-aurora/20 text-xs text-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-aurora shrink-0" />
                <span>This quiz will be linked to your lesson and appear in the course workspace.</span>
              </div>
            )}

            {/* Primary Action Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-bold h-12 text-base shadow-sm hover:translate-y-[-1px] transition-all duration-200 group bg-primary hover:bg-primary/95 text-primary-foreground"
              disabled={generateQuiz.isPending || questionTypes.length === 0}
            >
              {generateQuiz.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Forging your quiz…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Forge the quiz</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Calibrated by SkillForge AI Engine · Instant practice generation
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
