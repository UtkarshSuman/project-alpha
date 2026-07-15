// ============================================================================
// FEATURE: LLM provider switch
// Change CHAT_PROVIDER in .env 
// ============================================================================

const provider = process.env.CHAT_PROVIDER || "groq";

export async function generateChatCompletion(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  if (provider === "anthropic") {
    const { generateChatCompletion } = await import("./chat-anthropic");
    return generateChatCompletion(systemPrompt, conversationHistory, userMessage);
  }
  const { generateChatCompletion } = await import("./chat-groq");
  return generateChatCompletion(systemPrompt, conversationHistory, userMessage);
}