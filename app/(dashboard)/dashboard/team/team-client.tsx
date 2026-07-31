// FEATURE: Client wrapper for the team page (owns invite dialog state)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamMembersList } from "@/components/dashboard/team-members-list";
import { InviteDialog } from "@/components/dashboard/invite-dialog";
import { UserPlus } from "lucide-react";

export function TeamPageClient({
  currentUserId,
  canManage,
  initialMembers,
  initialInvites,
}: {
  currentUserId: string;
  canManage: boolean;
  initialMembers: any[];
  initialInvites: any[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Team</h1>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus size={16} className="mr-1.5" /> Invite
          </Button>
        )}
      </div>

      <div className="mt-8">
        <TeamMembersList members={initialMembers} invites={initialInvites} currentUserId={currentUserId} canManage={canManage} />
      </div>

      <InviteDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}