// ============================================================================
// FEATURE: LLM completion
// Switch to this lib/ai/chat.ts for
// the switch. 
// ============================================================================

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateChatCompletion(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: systemPrompt,
    messages: [...conversationHistory, { role: "user", content: userMessage }],
  });

  const textBlock = completion.content.find((b : any) => b.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "I'm not sure how to respond to that.";
}