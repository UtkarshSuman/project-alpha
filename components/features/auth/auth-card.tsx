// FEATURE: Shared login/register card. Mounted once per page with the
// matching initialMode so deep links to /login and /register still work —
// switching tabs afterward is local state only, never a route change.
"use client";

import { useState } from "react";
import { AuthTabs } from "./auth-tabs";
import { LoginFields } from "./login-fields";
import { RegisterFields } from "./register-fields";


type AuthMode = "login" | "register";

export function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  function handleModeChange(next: AuthMode) {
    setMode(next);
    // Cosmetic URL sync only — bypasses next/navigation on purpose so this
    // never causes a route transition or remount, just an instant swap.
    window.history.replaceState(null, "", `/${next}${window.location.search}`);
  }

  return (
    <div>
      <AuthTabs mode={mode} onChange={handleModeChange} />
      <div id="auth-panel" role="tabpanel" className="mt-9">
        {mode === "login" ? (
          <LoginFields onSwitchToRegister={() => handleModeChange("register")} />
        ) : (
          <RegisterFields onSwitchToLogin={() => handleModeChange("login")} />
        )}
      </div>
    </div>
  );
}
