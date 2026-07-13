// FEATURE: Chatbot card shown in the dashboard grid
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

type ChatbotCardProps = {
  id: string;
  name: string;
  status: string;
  documentCount: number;
  apiKeyCount: number;
};

export function ChatbotCard({ id, name, status, documentCount, apiKeyCount }: ChatbotCardProps) {
  return (
    <Link
      href={`/chatbots/${id}`}
      className="block rounded-lg border border-line bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink">
          <Bot size={18} className="text-accent" />
        </div>
        <Badge status={status} />
      </div>
      <h3 className="mt-4 font-display font-medium">{name}</h3>
      <p className="mt-1 text-xs text-muted">
        {documentCount} document{documentCount !== 1 ? "s" : ""} · {apiKeyCount} key{apiKeyCount !== 1 ? "s" : ""}
      </p>
    </Link>
  );
}