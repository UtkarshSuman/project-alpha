// FEATURE: Dashboard shell — server-side auth guard + DashboardShell client wrapper.
// Auth check stays here (Server Component) so no dashboard page ever needs to check
// auth itself. DashboardShell (client) holds sidebar/topbar shared state.
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { EnvBanner } from "@/components/dashboard/env-banner";
import { Toaster } from "@/components/ui/toast";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Pass only serializable user fields to the client component — no Prisma objects
  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <EnvBanner />
      <DashboardShell user={user}>{children}</DashboardShell>
      {/* FEATURE: Toast portal — one mount point for the whole dashboard */}
      <Toaster />
    </div>
  );
}