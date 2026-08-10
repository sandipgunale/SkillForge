import { z } from "zod";

export const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student", description: "Learn, take quizzes, and track progress" },
  { value: "INSTRUCTOR", label: "Instructor", description: "Create resources, quizzes, and learning paths" },
];

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      "Password must contain uppercase, lowercase and a number"
    ),

  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
});

export const defaultRegisterValues = {
  fullName: "",
  email: "",
  password: "",
  role: "STUDENT",
};