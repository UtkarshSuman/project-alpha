"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { Copy, Check, Mail, Shield, UserCheck, CheckCircle2 } from "lucide-react";

export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailWasSent, setEmailWasSent] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organization/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to create invitation");
        toast({
          title: "Invite failed",
          description: data.error ?? "Failed to create invitation",
          variant: "error",
        });
        return;
      }

      setLink(`${window.location.origin}/invite/${data.invite.token}`);
      setEmailWasSent(Boolean(data.emailSent));
      toast({
        title: "Invitation created",
        description: data.emailSent
          ? `Invitation email dispatched to ${email}`
          : `Share the generated link with ${email}`,
        variant: "success",
      });
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setLink(null);
    setEmail("");
    setRole("MEMBER");
    setError(null);
    setCopied(false);
    onClose();
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard",
      variant: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={link ? "Invitation Ready" : "Invite Teammate"}
    >
      {!link ? (
        <form onSubmit={handleCreate} className="space-y-5">
          <p className="text-xs text-muted leading-relaxed">
            Invite a colleague to collaborate on your chatbots, tool agents, documents, and analytics.
          </p>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Teammate Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="pl-9"
                required
                error={error ?? undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Permission Role</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole("MEMBER")}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  role === "MEMBER"
                    ? "border-accent bg-accent/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : "border-line bg-surface hover:border-line/80"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className={`h-4 w-4 ${role === "MEMBER" ? "text-accent" : "text-muted"}`} />
                  <span className="text-sm font-medium text-text">Member</span>
                </div>
                <span className="text-[11px] text-muted mt-1 leading-snug">
                  Can build, test, and manage chatbots and tools.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  role === "ADMIN"
                    ? "border-accent-2 bg-accent-2/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "border-line bg-surface hover:border-line/80"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className={`h-4 w-4 ${role === "ADMIN" ? "text-accent-2" : "text-muted"}`} />
                  <span className="text-sm font-medium text-text">Admin</span>
                </div>
                <span className="text-[11px] text-muted mt-1 leading-snug">
                  Full access including billing, workspace keys, and team invites.
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Send Invitation
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface/60 p-3.5">
            <CheckCircle2 className="h-5 w-5 text-accent-2 shrink-0 mt-0.5" />
            <div className="text-xs text-text space-y-1">
              <p className="font-medium text-sm">
                {emailWasSent ? "Invitation email sent!" : "Invite link generated!"}
              </p>
              <p className="text-muted leading-relaxed">
                {emailWasSent
                  ? `An email has been delivered to ${email}. You can also send them the direct link below.`
                  : `Automated email dispatch is not active in this environment. Share this secure 7-day link directly with ${email}:`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-line bg-ink p-2.5">
            <span className="flex-1 truncate font-mono text-xs text-text select-all px-1">
              {link}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 gap-1.5 h-8 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-accent-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <div className="pt-2">
            <Button onClick={handleClose} className="w-full" variant="secondary">
              Done
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}