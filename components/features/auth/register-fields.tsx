"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterFields({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/chatbots";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    router.push(`/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Start free</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
          Create your AI service workspace.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
          Start with a grounded retrieval service today, with room for agents, automation, and CAG as the platform grows.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Utkarsh Suman"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 bg-ink transition-colors duration-fast"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="founder@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-ink transition-colors duration-fast"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-12 bg-ink transition-colors duration-fast"
          />
        </div>

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        <Button
          type="submit"
          loading={loading}
          className="h-12 w-full text-sm font-semibold"
        >
          Create account
        </Button>
      </form>

      <p className="mt-5 rounded-md border border-line bg-ink px-3 py-2 text-xs leading-5 text-muted">
        Free plan includes 100 monthly messages and one live retrieval service. No card required.
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-accent-2 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
