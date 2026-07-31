// FEATURE: Team members list — shows members + pending invites, remove action
"use client";

import { useState } from "react";
import { Trash2, Clock } from "lucide-react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
};
type PendingInvite = { id: string; email: string; role: string };

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
  const [items, setItems] = useState(members);

  async function handleRemove(membershipId: string) {
    const res = await fetch(`/api/organization/members/${membershipId}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((m) => m.id !== membershipId));
  }

  return (
    <div className="space-y-2">
      {items.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-sm text-text">
              {m.user.name ?? m.user.email} {m.user.id === currentUserId && <span className="text-muted">(you)</span>}
            </p>
            <p className="text-xs text-muted">{m.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs text-muted">{m.role.toLowerCase()}</span>
            {canManage && m.role !== "OWNER" && (
              <button onClick={() => handleRemove(m.id)} className="text-muted hover:text-red-400">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}

      {invites.map((inv) => (
        <div key={inv.id} className="flex items-center justify-between rounded-md border border-dashed border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted" />
            <p className="text-sm text-muted">{inv.email}</p>
          </div>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs text-muted">pending &middot; {inv.role.toLowerCase()}</span>
        </div>
      ))}
    </div>
  );
}