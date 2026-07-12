// FEATURE: Dashboard topbar — shows signed-in user + sign out
"use client";

import { signOut, useSession } from "next-auth/react";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-line px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{session?.user?.email}</span>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-muted hover:text-text">
          Sign out
        </button>
      </div>
    </header>
  );
}