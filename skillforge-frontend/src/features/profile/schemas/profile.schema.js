import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  avatarUrl: z
    .string()
    .trim()
    .optional(),

  skillLevel: z
    .string()
    .optional(),
});

export const defaultProfileValues = {
  fullName: "",
  email: "",
  avatarUrl: "",
  skillLevel: "",
};