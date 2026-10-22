// FEATURE: SessionProvider wrapper — required for useSession()/signIn()/
// signOut() to work in client components (login/register pages, topbar).
// Without this, those hooks throw "useSession must be wrapped in a SessionProvider".
//
// FEATURE: GuideProvider + UveriqGuide — mascot assistant mounted here so it
// is available app-wide. UveriqGuide is dynamically imported with ssr:false to
// prevent any browser-only API from running during server rendering.
"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { GuideProvider } from "@/components/mascot/guide-context";

// SSR-safe: UveriqGuide uses window/document APIs for event delegation and
// position measurements. It must never execute on the server.
const UveriqGuide = dynamic(
  () => import("@/components/mascot/uveriq-guide").then((m) => ({ default: m.UveriqGuide })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuideProvider>
        {children}
        <UveriqGuide />
      </GuideProvider>
    </SessionProvider>
  );
}