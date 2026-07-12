// FEATURE: Login page using NextAuth's credentials provider (signIn from
// next-auth/react). Also shows a success banner after registration redirect.
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <>
      <h1 className="font-display text-xl font-semibold">Sign in</h1>
      {justRegistered && (
        <p className="mt-2 rounded-md bg-accent-2/10 px-3 py-2 text-sm text-accent-2">
          Account created — sign in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="mt-3 w-full rounded-md border border-line py-2.5 text-sm text-text hover:bg-surface-hover"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        No account? <Link href="/register" className="text-accent-2">Create one</Link>
      </p>
    </>
  );
}