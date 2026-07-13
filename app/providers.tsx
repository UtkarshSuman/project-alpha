// FEATURE: SessionProvider wrapper — required for useSession()/signIn()/
// signOut() to work in client components (login/register pages, topbar).
// Without this, those hooks throw "useSession must be wrapped in a SessionProvider".
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}