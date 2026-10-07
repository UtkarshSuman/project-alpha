import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 md:py-16 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight text-slate-900"
            >
              uveriq<span className="text-blue-600">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500">
              The unified operating layer for modular AI services. Build grounded
              retrieval, tool-using action agents, and scalable business workflows.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/services/new" className="hover:text-slate-900">
                  Service Catalog
                </Link>
              </li>
              <li>
                <Link href="/chatbots" className="hover:text-slate-900">
                  Knowledge Retrieval
                </Link>
              </li>
              <li>
                <Link href="/tool-agents" className="hover:text-slate-900">
                  Tool Agents
                </Link>
              </li>
              <li>
                <Link href="/automation-agents" className="hover:text-slate-900">
                  Lead Automations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
              Developers
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#developers" className="hover:text-slate-900">
                  REST API Docs
                </a>
              </li>
              <li>
                <a href="#composer" className="hover:text-slate-900">
                  Service Composer
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900">
                  Usage & Limits
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900">
                  API Key Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
              Company
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-slate-900">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <a href="mailto:support@uveriq.ai" className="hover:text-slate-900">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-900">
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Uveriq Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
