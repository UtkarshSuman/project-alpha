// FEATURE: Registration page — preserves callbackUrl through to login so
// invite links (and similar deep-links) survive the register -> login hop.
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}