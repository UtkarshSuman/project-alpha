// FEATURE: Organization settings form — rename org, copy identifiers, view account
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { Building2, User, Copy, Check, Shield } from "lucide-react";

export function SettingsForm({
  initialName,
  orgId,
  plan,
  email,
  userName,
}: {
  initialName: string;
  orgId: string;
  plan: string;
  email: string;
  userName?: string;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: "Save failed",
          description: data.error ?? "Failed to update workspace name",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Workspace updated",
        description: "Your workspace profile has been saved.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Network error occurred while saving.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCopyId() {
    navigator.clipboard.writeText(orgId);
    setCopiedId(true);
    toast({
      title: "Copied to clipboard",
      description: "Workspace Organization ID copied.",
      variant: "success",
    });
    setTimeout(() => setCopiedId(false), 2000);
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl space-y-6">
      {/* Workspace Profile Card */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink border border-line text-accent">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-text">Workspace Details</h3>
            <p className="text-xs text-muted">The public organization name visible to your team.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Workspace Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              className="max-w-md bg-ink"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Organization Identifiers & Tier */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink border border-line text-accent-2">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-text">Identifiers & Plan</h3>
            <p className="text-xs text-muted">Technical references for API integrations and billing.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-line bg-ink p-3.5">
            <div>
              <p className="text-xs text-muted font-medium">Organization ID</p>
              <p className="font-mono text-xs text-text select-all mt-0.5">{orgId}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyId}
              className="shrink-0 gap-1.5 h-8 text-xs self-start sm:self-center"
            >
              {copiedId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-accent-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy ID
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-ink p-3.5">
            <div>
              <p className="text-xs text-muted font-medium">Subscription Tier</p>
              <p className="font-semibold text-text mt-0.5">{plan} Plan</p>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-bold font-mono text-accent uppercase">
              {plan}
            </span>
          </div>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink border border-line text-muted">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-text">Signed-in User</h3>
            <p className="text-xs text-muted">Your active session account credentials.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-surface to-ink border border-line text-sm font-bold text-text shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-text">{userName || email}</p>
            <p className="text-xs font-mono text-muted">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}