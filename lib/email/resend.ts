// FEATURE: Resend client singleton — transactional email
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM || "Docent <onboarding@resend.dev>";