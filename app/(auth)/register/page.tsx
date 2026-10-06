// FEATURE: Registration page — preserves callbackUrl through to login so
// invite links (and similar deep-links) survive the register -> login hop.
import { Suspense } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard initialMode="register" />
    </Suspense>
  );
}