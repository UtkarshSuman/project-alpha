// FEATURE: Accept-invite client action with loading state and error handling
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";

export function InviteAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to accept workspace invitation");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error while accepting invitation");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger text-left">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Button
        onClick={handleAccept}
        loading={loading}
        className="w-full gap-2 text-xs font-semibold"
      >
        Accept & Join Workspace
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}