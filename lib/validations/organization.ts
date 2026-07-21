// FEATURE: Zod schema for organization settings
import { z } from "zod";

export const updateOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
});