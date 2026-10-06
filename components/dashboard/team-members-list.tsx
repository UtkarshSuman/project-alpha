"use client";

import { useState } from "react";
import { Trash2, Clock, ShieldCheck, Shield, User, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
};

type PendingInvite = {
  id: string;
  email: string;
  role: string;
};

export function TeamMembersList({
  members,
  invites,
  currentUserId,
  canManage,
}: {
  members: Member[];
  invites: PendingInvite[];
  currentUserId: string;
  canManage: boolean;
}) {
  const { toast } = useToast();
  const [memberList, setMemberList] = useState(members);
  const [inviteList, setInviteList] = useState(invites);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRemove(membershipId: string, memberName: string) {
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    setRemovingId(membershipId);
    try {
      const res = await fetch(`/api/organization/members/${membershipId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: "Failed to remove member",
          description: data.error ?? "Could not remove member from workspace",
          variant: "error",
        });
        return;
      }

      setMemberList((prev) => prev.filter((m) => m.id !== membershipId));
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "error",
      });
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRevokeInvite(inviteId: string, email: string) {
    if (!confirm(`Cancel invitation for ${email}?`)) {
      return;
    }

    setRevokingId(inviteId);
    try {
      const res = await fetch(`/api/organization/invites/${inviteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: "Revoke failed",
          description: data.error ?? "Could not cancel invitation",
          variant: "error",
        });
        return;
      }

      setInviteList((prev) => prev.filter((i) => i.id !== inviteId));
      toast({
        title: "Invitation revoked",
        description: `Invite for ${email} has been cancelled.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "error",
      });
    } finally {
      setRevokingId(null);
    }
  }

  function getInitials(name: string | null, email: string) {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  }

  function renderRoleBadge(role: string) {
    const normalized = role.toUpperCase();
    if (normalized === "OWNER") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent uppercase">
          <ShieldCheck className="h-3 w-3" />
          Owner
        </span>
      );
    }
    if (normalized === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-2/30 bg-accent-2/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent-2 uppercase">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink px-2.5 py-0.5 text-[11px] font-medium text-muted uppercase">
        <User className="h-3 w-3" />
        Member
      </span>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Workspace Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-muted">
            Workspace Members ({memberList.length})
          </h2>
        </div>

        <div className="divide-y divide-line rounded-xl border border-line bg-surface/50 overflow-hidden shadow-sm">
          {memberList.map((m) => {
            const isSelf = m.user.id === currentUserId;
            const initials = getInitials(m.user.name, m.user.email);
            const isRemoving = removingId === m.id;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-surface/80"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-surface to-ink border border-line text-xs font-bold text-text shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-text">
                        {m.user.name || m.user.email}
                      </p>
                      {isSelf && (
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                          You
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted font-mono">{m.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {renderRoleBadge(m.role)}

                  {canManage && m.role !== "OWNER" && !isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(m.id, m.user.name || m.user.email)}
                      loading={isRemoving}
                      className="text-muted hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {inviteList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-muted">
              Pending Invitations ({inviteList.length})
            </h2>
          </div>

          <div className="divide-y divide-line rounded-xl border border-dashed border-line bg-surface/30 overflow-hidden">
            {inviteList.map((inv) => {
              const isRevoking = revokingId === inv.id;
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-surface/50"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-line bg-ink text-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text font-mono">
                        {inv.email}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                        <Clock className="h-3 w-3 text-accent" />
                        <span>Invitation pending &middot; Expires in 7 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-mono text-muted uppercase">
                      {inv.role}
                    </span>

                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(inv.id, inv.email)}
                        loading={isRevoking}
                        className="text-muted hover:text-red-400 hover:bg-red-500/10 text-xs gap-1.5 h-8 px-2.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}