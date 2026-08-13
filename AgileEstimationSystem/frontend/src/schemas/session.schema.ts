import { z } from "zod";

/** Mirrors AgileEstimation.Domain.Constants.SessionConstants.MaxTitleLength (200). */
export const createSessionSchema = z.object({
  title: z
    .string()
    .min(1, "Give your session a title")
    .max(200, "Title must be under 200 characters"),
});

export type CreateSessionFormValues = z.infer<typeof createSessionSchema>;

/** Mirrors SessionConstants.SessionCodeLength (6) and the code alphabet used by SessionService. */
export const joinSessionSchema = z.object({
  sessionCode: z
    .string()
    .min(1, "Enter a session code")
    .length(6, "Session codes are 6 characters")
    .transform((value) => value.toUpperCase()),
});

export type JoinSessionFormValues = z.infer<typeof joinSessionSchema>;
