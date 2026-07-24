import { z } from "zod";

export const quizSetupSchema = z
  .object({
    source: z.enum([
      "TOPIC",
      "LEARNING_PATH",
    ]),

    topicId: z.string().optional(),

    learningPathId: z.string().optional(),

    weekNumber: z.number().optional(),

    difficulty: z.enum([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ]),

    questionCount: z.number().min(1).max(20),

    questionTypes: z.array(z.string()).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.source === "TOPIC") {
      if (!data.topicId) {
        ctx.addIssue({
          code: "custom",
          path: ["topicId"],
          message: "Please select a topic.",
        });
      }
    }

    if (data.source === "LEARNING_PATH") {
      if (!data.learningPathId) {
        ctx.addIssue({
          code: "custom",
          path: ["learningPathId"],
          message: "Please select a learning path.",
        });
      }

      if (!data.weekNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["weekNumber"],
          message: "Please select a week.",
        });
      }
    }
  });