// FEATURE: LLM provider switch — now with a streaming variant.
// Non-Groq (paid) providers fall back to a single-chunk "stream" (the whole
// answer yielded at once) until a real streaming implementation is added
// for them — flagged, not silently pretended to be true token streaming.
// Change CHAT_PROVIDER in .env 

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

export async function* generateChatCompletionStream(
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): AsyncGenerator<string> {
  if (provider === "anthropic") {
    const { generateChatCompletion } = await import("./chat-anthropic");
    const full = await generateChatCompletion(systemPrompt, conversationHistory, userMessage);
    yield full; // single-chunk fallback — see note above
    return;
  }
  const { generateChatCompletionStream } = await import("./chat-groq");
  yield* generateChatCompletionStream(systemPrompt, conversationHistory, userMessage);
}