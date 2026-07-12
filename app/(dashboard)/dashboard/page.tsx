// FEATURE: Dashboard overview — placeholder until Chatbots section is built.
// Empty state follows the "invitation to act" principle, not a blank page.
export default function DashboardOverview() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold">No chatbots yet</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Upload a document to create your first chatbot. It'll be ready to embed in under a minute.
      </p>
    </div>
  );
}