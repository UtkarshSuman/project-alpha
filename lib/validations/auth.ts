// FEATURE: Zod schemas for auth forms — validated on the server, not just
// the client, since client-side validation can always be bypassed.
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;