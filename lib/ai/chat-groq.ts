// ============================================================================
// FEATURE: LLM completion — FREE TIER via Groq
// Model is read from GROQ_MODEL env var instead of hardcoded, since Groq's
// available model lineup changes over time — this makes swapping models a
// config change, not a code deploy.
// Streaming feature added
// ============================================================================

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export async function generateChatCompletion(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...conversationHistory, { role: "user", content: userMessage }],
    temperature: 0.3,
    max_tokens: 800,
  });
  return completion.choices[0]?.message?.content ?? "I'm not sure how to respond to that.";
}

// FEATURE: Streaming completion — yields text deltas as they arrive from Groq.
export async function* generateChatCompletionStream(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): AsyncGenerator<string> {
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...conversationHistory, { role: "user", content: userMessage }],
    temperature: 0.3,
    max_tokens: 800,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}