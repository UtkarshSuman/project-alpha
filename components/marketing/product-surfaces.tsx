import { Container } from "@/components/ui/container";

export function ProductSurfaces() {
  return (
    <section className="border-t border-line py-24">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Customer surfaces</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
            Ship where the work already happens.
          </h2>
          <p className="mt-4 text-muted">
            Embed a widget on a site, or call the same retrieval service from your own product with a scoped key.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-line bg-surface p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Widget</p>
            <h3 className="mt-4 font-display text-2xl font-medium">Site embed with origin control</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Drop a script tag, theme the bubble, and lock allowed origins so the chatbot only serves on domains you approve.
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-line bg-ink">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm">Support</span>
                <span className="rounded-sm bg-success/10 px-2 py-1 font-mono text-[10px] text-success">ready</span>
              </div>
              <div className="space-y-3 p-4">
                <p className="ml-auto max-w-[80%] rounded-md bg-accent/15 px-3 py-2 text-sm">How do I rotate an API key?</p>
                <p className="max-w-[88%] rounded-md border border-line bg-surface px-3 py-2 text-sm">
                  Revoke the current key in the service settings, then create a replacement scoped to the same chatbot.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-line bg-surface p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-2">API</p>
            <h3 className="mt-4 font-display text-2xl font-medium">Scoped keys per service</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Each key belongs to one service. Revoke it without touching the rest of the workspace, and keep usage on the analytics tab.
            </p>
            <pre className="mt-8 overflow-x-auto rounded-lg border border-line bg-ink p-4 font-mono text-code-sm leading-7 text-muted">
              <code>{`POST /api/chat/[serviceid]
Authorization: Bearer uveriq_live_...
{
  "messages": [{ "role": "user", "content": "..." }]
}`}</code>
            </pre>
          </article>
        </div>
      </Container>
    </section>
  );
}
