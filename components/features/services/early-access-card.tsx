"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/use-toast";
import { Sparkles, CheckCircle2, Mail } from "lucide-react";

export function EarlyAccessCard({
  serviceName,
  userEmail,
}: {
  serviceName: string;
  userEmail: string;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState(userEmail);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setJoined(true);
      toast({
        title: "Waitlist Joined",
        description: `We've registered your interest for ${serviceName} early access.`,
        variant: "success",
      });
    }, 600);
  }

  if (joined) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-accent-2/30 bg-accent-2/10 p-5 text-sm text-text">
        <CheckCircle2 className="h-5 w-5 text-accent-2 shrink-0" />
        <div>
          <p className="font-semibold text-text">You're on the early access list!</p>
          <p className="text-xs text-muted mt-0.5">
            We will email <strong className="text-text">{email}</strong> as soon as the private beta is ready for your workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/70 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
        <Sparkles className="h-4 w-4" />
        Private Developer Beta
      </div>
      <h3 className="font-display text-lg font-bold text-text">Request Early Access to {serviceName}</h3>
      <p className="text-xs text-muted mt-1 leading-relaxed max-w-lg">
        We are granting access in waves to teams with high-throughput workflow requirements. Leave your email to receive direct API keys during the next sandbox release.
      </p>

      <form onSubmit={handleJoin} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-md">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            type="email"
            placeholder="developer@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-9 bg-ink h-10 text-xs"
          />
        </div>
        <Button type="submit" loading={loading} className="shrink-0 text-xs h-10">
          Request Beta Key
        </Button>
      </form>
    </div>
  );
}
