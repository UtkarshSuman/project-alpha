// FEATURE: Organization & workspace settings page
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { requireOrg } from "@/lib/auth/session";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const { orgId } = await requireOrg();
  const session = await getServerSession(authOptions);

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-accent" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-text">
            Workspace Settings
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Manage your organization profile, unique identifiers, and account credentials.
        </p>
      </div>

      <div className="mt-6">
        <SettingsForm
          initialName={org.name}
          orgId={org.id}
          plan={org.plan}
          email={session?.user?.email ?? ""}
          userName={session?.user?.name ?? ""}
        />
      </div>
    </div>
  );
}