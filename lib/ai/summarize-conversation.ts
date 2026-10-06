// ============================================================================
// FEATURE: Conversation summarization for long-term memory
//
// Design choice: INCREMENTAL summarization, not full-recompute.
// Once a conversation is long, re-summarizing the entire history every
// time a new batch ages out would mean re-reading (and re-paying for)
// the whole conversation repeatedly. Instead, we fold only the NEWLY
// aged-out messages into the EXISTING summary — the LLM sees the old
// summary plus the new chunk, and produces an updated, still-compact
// summary. Cost stays roughly constant per compression, not growing
// with conversation length.
// ============================================================================

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_TOOL_MODEL || "openai/gpt-oss-120b";

export async function summarizeIncrement(
  previousSummary: string | null,
  newMessages: { role: string; content: string }[]
): Promise<string> {
  if (newMessages.length === 0) return previousSummary ?? "";

  const transcript = newMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const prompt = previousSummary
    ? `Here is a running summary of an earlier conversation:\n\n${previousSummary}\n\nHere are the next messages in that conversation:\n\n${transcript}\n\nUpdate the summary to incorporate these new messages. Keep it concise — capture facts, decisions, and context the assistant would need later, not verbatim dialogue. Return ONLY the updated summary text, nothing else.`
    : `Summarize this conversation concisely, capturing facts, decisions, and context that would matter for continuing it later. Return ONLY the summary text, nothing else.\n\n${transcript}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 300, // summaries stay compact by design
  });

  return completion.choices[0]?.message?.content?.trim() ?? previousSummary ?? "";
}