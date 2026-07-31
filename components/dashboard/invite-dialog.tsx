// ============================================================================
// FEATURE: Invite dialog — creates an invite, shows a copyable link.
// No email service configured yet, so the link is shared manually. Swap
// this for automatic emailing later (e.g. Resend) by having the POST route
// also send an email — the UI doesn't need to change.
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/organization/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    const { invite } = await res.json();
    setLink(`${window.location.origin}/invite/${invite.token}`);
    router.refresh();
  }

  function handleClose() {
    setLink(null);
    setEmail("");
    setCopied(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={link ? "Invite link created" : "Invite a teammate"}>
      {!link ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full">{loading ? "Creating..." : "Create invite link"}</Button>
        </form>
      ) : (
        <div>
          <p className="mb-3 text-sm text-muted">Send this link to {email} — it expires in 7 days.</p>
          <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2 text-xs text-text">
            <span className="flex-1 truncate">{link}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
              }}
              className="text-muted hover:text-text"
            >
              {copied ? <Check size={16} className="text-accent-2" /> : <Copy size={16} />}
            </button>
          </div>
          <Button onClick={handleClose} className="mt-4 w-full" variant="secondary">Done</Button>
        </div>
      )}
    </Dialog>
  );
}