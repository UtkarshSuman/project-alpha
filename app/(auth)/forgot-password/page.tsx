// FEATURE: Request password reset page
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <h1 className="font-display text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for {email}, we've sent a password reset link.
        </p>
        <Link href="/login" className="mt-6 block text-center text-sm text-accent-2">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-xl font-semibold">Reset your password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full">{loading ? "Sending..." : "Send reset link"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-accent-2">Back to sign in</Link>
      </p>
    </>
  );
}