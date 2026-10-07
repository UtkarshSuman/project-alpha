// ============================================================================
// FEATURE: Tool-calling chat engine
// Uses Groq's OpenAI-compatible `tools` API: the LLM is given a list of
// available functions (derived from ToolDefinition rows) and decides
// whether to call one, we execute the real HTTP request (through the
// SSRF guard), feed the result back, and get a final natural-language answer.
//
// Loop is capped at 3 rounds to prevent runaway tool-calling chains from
// one user message (cost + latency safety).
// ============================================================================

// ============================================================================
// FEATURE: Tool-calling chat engine — now with a streaming variant.
// Tool-execution rounds stay non-streamed (deciding which tool to call,
// running it); only the FINAL natural-language answer streams to the user.
// ============================================================================

import Groq from "groq-sdk";
import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions";
import { assertUrlIsSafe } from "@/lib/security/ssrf-guard";
import type { ToolDefinition } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_TOOL_MODEL || "openai/gpt-oss-120b";
const MAX_TOOL_ROUNDS = 3;
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 100_000; // 100KB cap on tool response size fed back to the LLM

function toOpenAiTool(t: ToolDefinition): ChatCompletionTool {
  return { type: "function" as const, function: { name: t.name, description: t.description, parameters: t.paramsSchema as Record<string, unknown> } };
}

async function executeTool(tool: ToolDefinition, args: Record<string, unknown>): Promise<string> {
  await assertUrlIsSafe(tool.url);  // throws if unsafe — caller catches and reports to LLM as a tool error

  const url = new URL(tool.url);
  const headers: Record<string, string> = { ...(tool.headers as Record<string, string> | null ?? {}) };
  let body: string | undefined;
  if (tool.method === "GET") {
    Object.entries(args).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(args);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { method: tool.method, headers, body, signal: controller.signal });
    return (await res.text()).slice(0, MAX_RESPONSE_BYTES);
  } finally {
    clearTimeout(timeout);
  }
}

async function runToolRounds(
  messages: any[],
  tools: ToolDefinition[]
): Promise<{ messages: any[]; finalMessageReady: boolean }> {
  const toolSchemas = tools.map(toOpenAiTool);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolSchemas.length > 0 ? toolSchemas : undefined,
      temperature: 0.3,
      max_tokens: 800,
    });

    const choice = completion.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      // Model is ready to answer — don't consume this answer, the caller
      // will re-request it via streaming for the actual response to the user.
      return { messages, finalMessageReady: true };
    }

    messages.push(choice.message);

    for (const call of toolCalls) {
      const tool = tools.find((t) => t.name === call.function.name);
      let resultText: string;
      if (!tool) {
        resultText = `Error: tool "${call.function.name}" not found`;
      } else {
        try {
          const args = JSON.parse(call.function.arguments || "{}");
          resultText = await executeTool(tool, args);
        } catch (err: any) {
          resultText = `Error calling tool: ${err.message}`;
        }
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: resultText });
    }
  }

  return { messages, finalMessageReady: true }; // round cap hit — force a final answer attempt
}

export async function generateToolChatCompletion(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  tools: ToolDefinition[]
): Promise<string> {
  const messages: any[] = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: userMessage }];
  const { messages: finalMessages } = await runToolRounds(messages, tools);

  const completion = await groq.chat.completions.create({ model: MODEL, messages: finalMessages, temperature: 0.3, max_tokens: 800 });
  return completion.choices[0]?.message?.content ?? "I'm not sure how to respond to that.";
}

// FEATURE: Streaming variant — runs the same tool-resolution rounds
// non-streamed, then streams only the final answer.
export async function* generateToolChatCompletionStream(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  tools: ToolDefinition[]
): AsyncGenerator<string> {
  const messages: any[] = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: userMessage }];
  const { messages: finalMessages } = await runToolRounds(messages, tools);

  const stream = await groq.chat.completions.create({ model: MODEL, messages: finalMessages, temperature: 0.3, max_tokens: 800, stream: true });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
