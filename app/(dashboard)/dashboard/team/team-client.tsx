"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamMembersList } from "@/components/dashboard/team-members-list";
import { InviteDialog } from "@/components/dashboard/invite-dialog";
import { UserPlus, Users, ShieldAlert } from "lucide-react";

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

export function TeamPageClient({
  currentUserId,
  canManage,
  initialMembers,
  initialInvites,
}: {
  currentUserId: string;
  canManage: boolean;
  initialMembers: Member[];
  initialInvites: PendingInvite[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text">
              Team & Permissions
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Manage who has access to this workspace, view pending invites, and configure role assignments.
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
            <UserPlus size={16} />
            Invite Teammate
          </Button>
        )}
      </div>

      {!canManage && (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface/50 p-3 text-xs text-muted">
          <ShieldAlert className="h-4 w-4 text-accent shrink-0" />
          <span>
            You have Member access. Only Workspace Owners and Admins can send invitations and manage team roles.
          </span>
        </div>
      )}

      {/* Team Members List */}
      <div className="mt-6">
        <TeamMembersList
          members={initialMembers}
          invites={initialInvites}
          currentUserId={currentUserId}
          canManage={canManage}
        />
      </div>

      <InviteDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}