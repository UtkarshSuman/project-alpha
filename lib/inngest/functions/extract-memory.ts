// ============================================================================
// FEATURE: Background memory extraction — runs after a long-term-memory
// chatbot conversation, reads the exchange, pulls out durable facts about
// the visitor, embeds each one, and stores it for future semantic retrieval.
// Uses Inngest v4 syntax (triggers inside config, 2-arg signature).
// ============================================================================

import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { generateChatCompletion } from "@/lib/ai/chat";
import { embedTexts } from "@/lib/ai/embeddings";
import { nanoid } from "nanoid";

export const extractMemory = inngest.createFunction(
  { id: "extract-memory", triggers: { event: "chat/memory.extract" }, retries: 1 },
  async ({ event, step }) => {
    const { conversationId, chatbotId, visitorIdentifier } = event.data as {
      conversationId: string;
      chatbotId: string;
      visitorIdentifier: string;
    };

    const facts = await step.run("extract-facts", async () => {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

      const extractionPrompt =
        "From this conversation, extract 1-5 key durable facts about the user (preferences, context, identity — not one-off requests). " +
        'Return ONLY a JSON array of short strings, nothing else. If there are no notable durable facts, return [].';

      const raw = await generateChatCompletion(extractionPrompt, [], conversationText);

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((f) => typeof f === "string" && f.trim()) : [];
      } catch {
        return [];
      }
    });

    if (facts.length === 0) return { saved: 0 };

    await step.run("embed-and-save", async () => {
      const embeddings = await embedTexts(facts);

      for (let i = 0; i < facts.length; i++) {
        const vectorLiteral = `[${embeddings[i].join(",")}]`;
        await prisma.$executeRaw`
          INSERT INTO "UserMemory" (id, "chatbotId", "visitorIdentifier", content, importance, embedding, "updatedAt")
          VALUES (${nanoid()}, ${chatbotId}, ${visitorIdentifier}, ${facts[i]}, 0.5, ${vectorLiteral}::vector, now())
        `;
      }
    });

    return { saved: facts.length };
  }
);