import { Suspense } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard initialMode="login" />
    </Suspense>
  );
}