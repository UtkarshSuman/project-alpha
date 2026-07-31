// FEATURE: Accept-invite client action
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function InviteAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    const res = await fetch(`/api/invites/${token}`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/chatbots");
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <Button onClick={handleAccept} className="w-full">
        {loading ? "Joining..." : "Accept invite"}
      </Button>
    </div>
  );
}