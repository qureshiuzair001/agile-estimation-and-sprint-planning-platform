import { z } from "zod";
import { USER_ROLES } from "@/constants/roles";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * The 8-character password minimum below now mirrors a real backend rule
 * (RegisterRequestValidator.MinimumLength(8) — see the backend's
 * FluentValidation pass), so this is enforced on both sides, not just
 * here.
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(100, "Username must be under 100 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum([USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.MODERATOR]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
