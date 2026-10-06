// ============================================================================
// FEATURE: Tool Agent Detail Client Component
// Tabs for Tools, Interactive Playground, Scoped API Keys, and Agent Settings.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Cpu } from "lucide-react";
import { Tabs, TabPanel, type TabItem } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToolsList } from "./tools-list";
import { ToolAgentPlayground } from "./tool-agent-playground";
import { ToolAgentKeysSection, type KeyItem } from "./tool-agent-keys-section";
import { ToolAgentSettingsForm } from "./tool-agent-settings-form";
import type { ToolItem } from "./tool-definition-modal";

type AgentDetail = {
  id: string;
  serviceId: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  widgetTitle: string;
  widgetColor: string;
  welcomeMessage: string;
  allowedOrigins: string | null;
  tools: ToolItem[];
  service: {
    apiKeys: KeyItem[];
  };
};

type Props = {
  agent: AgentDetail;
};

const TABS: TabItem[] = [
  { id: "tools", label: "Tools" },
  { id: "playground", label: "Playground" },
  { id: "keys", label: "API Keys" },
  { id: "settings", label: "Settings" },
];

export function ToolAgentDetailClient({ agent }: Props) {
  const [activeTab, setActiveTab] = useState("tools");
  const status = agent.tools.length > 0 ? "READY" : "DRAFT";

  return (
    <div className="space-y-6">
      {/* Back navigation & Header */}
      <div>
        <Link
          href="/tool-agents"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text mb-3"
        >
          <ArrowLeft size={13} />
          Back to Tool Agents
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink ring-1 ring-line">
              <Zap size={20} className="text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-semibold text-text">{agent.name}</h1>
                <Badge status={status} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <Cpu size={12} className="text-muted/70" />
                <span>{agent.model}</span>
                <span className="opacity-40">·</span>
                <span>{agent.tools.length} tool{agent.tools.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div>
        <TabPanel id="tools" activeTab={activeTab}>
          <ToolsList toolAgentId={agent.id} initialTools={agent.tools} />
        </TabPanel>

        <TabPanel id="playground" activeTab={activeTab}>
          <div className="max-w-4xl">
            <div className="mb-4">
              <h2 className="font-display text-lg font-medium text-text">Interactive Playground</h2>
              <p className="text-xs text-muted">
                Test how the model selects and executes attached tools during conversation.
              </p>
            </div>
            <ToolAgentPlayground
              serviceId={agent.serviceId}
              agentName={agent.name}
              welcomeMessage={agent.welcomeMessage}
              toolCount={agent.tools.length}
            />
          </div>
        </TabPanel>

        <TabPanel id="keys" activeTab={activeTab}>
          <div className="max-w-3xl">
            <ToolAgentKeysSection
              toolAgentId={agent.id}
              initialKeys={agent.service.apiKeys}
            />
          </div>
        </TabPanel>

        <TabPanel id="settings" activeTab={activeTab}>
          <div className="max-w-3xl">
            <ToolAgentSettingsForm agent={agent} />
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
