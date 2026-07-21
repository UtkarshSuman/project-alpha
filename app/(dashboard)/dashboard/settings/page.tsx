// FEATURE: Settings page — org name, account info
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { requireOrg } from "@/lib/auth/session";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const { orgId } = await requireOrg();
  const session = await getServerSession(authOptions);

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <div className="mt-8">
        <SettingsForm initialName={org.name} email={session?.user?.email ?? ""} />
      </div>
    </div>
  );
}