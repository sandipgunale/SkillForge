import { z } from "zod";

export const quizSetupSchema = z.object({
  topicId: z
    .string()
    .min(1, "Please select a topic."),

  difficulty: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
  ]),

  questionCount: z
    .number()
    .min(1)
    .max(20),

  questionTypes: z.array(
    z.string()
  ),
});