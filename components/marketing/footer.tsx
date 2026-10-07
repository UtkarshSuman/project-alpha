import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface py-12 md:py-16 text-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight text-text"
            >
              uveriq<span className="text-accent">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">
              The unified operating layer for modular AI services. Build grounded
              retrieval, tool-using action agents, and scalable business workflows.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-text uppercase">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/services/new" className="hover:text-text transition-colors">
                  Service Catalog
                </Link>
              </li>
              <li>
                <Link href="/chatbots" className="hover:text-text transition-colors">
                  Knowledge Retrieval
                </Link>
              </li>
              <li>
                <Link href="/tool-agents" className="hover:text-text transition-colors">
                  Tool Agents
                </Link>
              </li>
              <li>
                <Link href="/automation-agents" className="hover:text-text transition-colors">
                  Lead Automations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-text uppercase">
              Developers
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#developers" className="hover:text-text transition-colors">
                  REST API Docs
                </a>
              </li>
              <li>
                <a href="#composer" className="hover:text-text transition-colors">
                  Service Composer
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-text transition-colors">
                  Usage & Limits
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-text transition-colors">
                  API Key Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-text uppercase">
              Company
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-text transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <a href="mailto:support@uveriq.ai" className="hover:text-text transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-text transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-text transition-colors">
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row text-xs text-muted">
          <p>© {new Date().getFullYear()} Uveriq Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-text cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-text cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-text cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
