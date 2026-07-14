// FEATURE: Dashboard overview — placeholder until Chatbots section is built.
// Empty state follows the "invitation to act" principle, not a blank page.
// FEATURE: Dashboard overview — redirects to /chatbots for now.
// A real analytics overview (usage graphs, recent conversations) gets built
// here in the Analytics section later. Redirecting avoids a dead-end page
// in the meantime.
import { redirect } from "next/navigation";

export default function DashboardOverview() {
  redirect("/chatbots");
}