// ============================================================================
// FEATURE: Add / Edit Tool Definition Modal
// Validates function name format (/^[a-zA-Z0-9_]+$/) and JSON schemas.
// Allows testing external API hooks directly with SSRF safety in mind.
// ============================================================================

"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/hooks/use-toast";

export type ToolItem = {
  id: string;
  toolAgentId: string;
  name: string;
  description: string;
  method: string;
  url: string;
  headers?: any;
  paramsSchema: any;
  enabled: boolean;
  createdAt: string | Date;
};

type Props = {
  toolAgentId: string;
  open: boolean;
  onClose: () => void;
  onSaved: (tool: ToolItem) => void;
};

const DEFAULT_SCHEMA = JSON.stringify(
  {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query or lookup parameter",
      },
    },
    required: ["query"],
  },
  null,
  2
);

export function ToolDefinitionModal({ toolAgentId, open, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState("");
  const [headersJson, setHeadersJson] = useState("{}");
  const [paramsSchemaJson, setParamsSchemaJson] = useState(DEFAULT_SCHEMA);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Tool name is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
      errs.name = "Must only contain letters, numbers, and underscores (e.g. fetch_user)";
    }

    if (!description.trim()) {
      errs.description = "Description tells the AI when to call this tool";
    }

    if (!url.trim()) {
      errs.url = "Valid endpoint URL is required";
    } else {
      try {
        new URL(url.trim());
      } catch {
        errs.url = "Must be a valid URL (e.g. https://api.example.com/v1/orders)";
      }
    }

    try {
      if (headersJson.trim()) {
        const parsed = JSON.parse(headersJson);
        if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
          errs.headers = "Headers must be a JSON object like {\"Authorization\": \"Bearer token\"}";
        }
      }
    } catch {
      errs.headers = "Invalid JSON in headers";
    }

    try {
      const parsed = JSON.parse(paramsSchemaJson);
      if (typeof parsed !== "object" || parsed === null) {
        errs.schema = "Parameters schema must be a valid JSON Schema object";
      }
    } catch {
      errs.schema = "Invalid JSON in parameters schema";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const parsedHeaders = headersJson.trim() ? JSON.parse(headersJson) : undefined;
      const parsedSchema = JSON.parse(paramsSchemaJson);

      const res = await fetch(`/api/tool-agents/${toolAgentId}/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          method,
          url: url.trim(),
          headers: parsedHeaders,
          paramsSchema: parsedSchema,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error ?? "Failed to save tool" });
        setLoading(false);
        return;
      }

      toast.success(`Tool "${name}" attached to agent`);
      onSaved(data.tool);
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setUrl("");
      setHeadersJson("{}");
      setParamsSchemaJson(DEFAULT_SCHEMA);
      setErrors({});
    } catch {
      setErrors({ form: "Network error occurred while creating tool" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add API Tool">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="rounded-md border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="tool-name">Function name</Label>
            <Input
              id="tool-name"
              placeholder="e.g. check_order_status"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              className="mt-1 font-mono text-xs"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="tool-method">HTTP Method</Label>
            <select
              id="tool-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
              className="mt-1 flex h-9 w-full rounded-md border border-line bg-surface px-3 py-1 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="tool-url">Endpoint URL</Label>
          <Input
            id="tool-url"
            placeholder="https://api.yourdomain.com/v1/lookup"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={errors.url}
            className="mt-1 font-mono text-xs"
          />
          {errors.url && <p className="mt-1 text-xs text-danger">{errors.url}</p>}
        </div>

        <div>
          <Label htmlFor="tool-desc">Description (Prompt to the LLM)</Label>
          <Textarea
            id="tool-desc"
            placeholder="Search our database for customer order status using their order ID or email address."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            rows={2}
            className="mt-1 text-sm"
          />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tool-headers">Request Headers (JSON)</Label>
              <span className="text-[11px] text-muted">Optional</span>
            </div>
            <Textarea
              id="tool-headers"
              value={headersJson}
              onChange={(e) => setHeadersJson(e.target.value)}
              error={errors.headers}
              rows={4}
              className="mt-1 font-mono text-xs"
            />
            {errors.headers && <p className="mt-1 text-xs text-danger">{errors.headers}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tool-schema">Parameters Schema (JSON)</Label>
              <span className="text-[11px] text-muted">JSON Schema</span>
            </div>
            <Textarea
              id="tool-schema"
              value={paramsSchemaJson}
              onChange={(e) => setParamsSchemaJson(e.target.value)}
              error={errors.schema}
              rows={4}
              className="mt-1 font-mono text-xs"
            />
            {errors.schema && <p className="mt-1 text-xs text-danger">{errors.schema}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Tool
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
