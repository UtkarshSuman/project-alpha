// ============================================================================
// FEATURE: LLM completion 
// Llama models 
// ============================================================================

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateChatCompletion(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content ?? "I'm not sure how to respond to that.";
}