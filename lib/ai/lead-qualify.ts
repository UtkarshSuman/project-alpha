// ============================================================================
// FEATURE: AI lead qualification + follow-up drafting
// Two LLM calls: (1) score the lead against the business's own criteria,
// returning strict JSON; (2) if qualified, draft a genuinely personalized
// follow-up referencing what the person actually asked about.
// ============================================================================

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export type QualificationResult = {
  qualified: boolean;
  score: number; // 0-1
  reasoning: string;
};

export async function qualifyLead(
  criteria: string,
  redFlags: string | null,
  lead: { name: string; email: string; message: string }
): Promise<QualificationResult> {
  const prompt = `You are screening an inbound lead for a business.

Qualification criteria: ${criteria}
${redFlags ? `Red flags to watch for: ${redFlags}` : ""}

Lead details:
Name: ${lead.name}
Email: ${lead.email}
Message: ${lead.message}

Return ONLY a JSON object with this exact shape, nothing else:
{"qualified": true or false, "score": a number from 0 to 1, "reasoning": "one short sentence explaining the decision"}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 200,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      qualified: Boolean(parsed.qualified),
      score: typeof parsed.score === "number" ? Math.max(0, Math.min(1, parsed.score)) : 0.5,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "No reasoning provided.",
    };
  } catch {
    return { qualified: false, score: 0, reasoning: "Could not evaluate this lead automatically." };
  }
}

export async function draftFollowUp(
  tone: string,
  businessName: string,
  lead: { name: string; message: string }
): Promise<string> {
  const prompt = `Write a short follow-up email from "${businessName}" to a lead named ${lead.name} who said: "${lead.message}"

Tone/style instructions: ${tone}

Write ONLY the email body (no subject line, no "Dear X," boilerplate greeting is fine if natural). Keep it under 120 words. Reference what they specifically asked about — do not write a generic template.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "Thanks for reaching out — we'll follow up shortly.";
}