import { z } from "zod";

/** Mirrors TicketConfiguration's HasMaxLength values in the Persistence layer. */
export const ticketSchema = z.object({
  title: z.string().min(1, "Give this ticket a title").max(200, "Title must be under 200 characters"),
  description: z.string().max(1000, "Description must be under 1000 characters"),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
