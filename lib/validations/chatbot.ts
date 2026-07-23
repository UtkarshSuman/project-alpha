// FEATURE: Zod schemas for chatbot create/update endpoints
import { z } from "zod";

export const createChatbotSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
});

export const updateChatbotSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  systemPrompt: z.string().min(1).max(4000).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  widgetTitle: z.string().max(60).optional(),
  widgetColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").optional(),
  widgetLogoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  welcomeMessage: z.string().max(300).optional(),
  restrictToContext: z.boolean().optional(),
  leadCaptureEnabled: z.boolean().optional(),
  allowedOrigins: z.string().max(1000).optional(),
});