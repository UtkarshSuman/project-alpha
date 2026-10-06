// ============================================================================
// FEATURE: Background lead processing — the actual automation engine.
// Qualify -> (if qualified) draft + send follow-up -> notify business owner
// -> update the activity feed record at every step so the dashboard shows
// real-time progress, not just a final result.
// ============================================================================

import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { qualifyLead, draftFollowUp } from "@/lib/ai/lead-qualify";
import { resend, EMAIL_FROM } from "@/lib/email/resend";

export const processLead = inngest.createFunction(
  {
    id: "process-lead",
    triggers: { event: "automation/lead.submitted" },
    retries: 2,
    onFailure: async ({ event }) => {
      const leadId = event.data?.event?.data?.leadId as string | undefined;
      if (!leadId) return;
      await prisma.leadRecord.update({
        where: { id: leadId },
        data: { status: "FAILED", errorMessage: "Processing failed after retries." },
      }).catch(() => {});
    },
  },
  async ({ event, step }) => {
    const { leadId } = event.data as { leadId: string };

    const lead = await step.run("load-lead", async () => {
      const record = await prisma.leadRecord.findUnique({
        where: { id: leadId },
        include: { automationAgent: true },
      });
      if (!record) throw new Error("Lead not found");
      return record;
    });

    const qualification = await step.run("qualify", async () =>
      qualifyLead(lead.automationAgent.qualificationCriteria, lead.automationAgent.redFlags, {
        name: lead.name,
        email: lead.email,
        message: lead.message,
      })
    );

    await step.run("save-qualification", async () => {
      await prisma.leadRecord.update({
        where: { id: leadId },
        data: {
          status: qualification.qualified ? "QUALIFIED" : "NOT_QUALIFIED",
          score: qualification.score,
          aiReasoning: qualification.reasoning,
        },
      });
    });

    if (qualification.qualified) {
      const followUpBody = await step.run("draft-followup", async () =>
        draftFollowUp(lead.automationAgent.followUpTone, lead.automationAgent.name, { name: lead.name, message: lead.message })
      );

      await step.run("send-followup", async () => {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: lead.email,
            subject: `Re: your message to ${lead.automationAgent.name}`,
            text: followUpBody,
          });
          await prisma.leadRecord.update({
            where: { id: leadId },
            data: { followUpSent: true, followUpBody },
          });
        } catch (err) {
          // Email send failure shouldn't fail the whole job — the lead is
          // still correctly qualified and visible in the activity feed,
          // just without an outbound email (e.g. sandbox restriction).
          await prisma.leadRecord.update({
            where: { id: leadId },
            data: { followUpBody, errorMessage: "Follow-up email could not be sent." },
          });
        }
      });

      if (lead.automationAgent.notifyEmail) {
        await step.run("notify-owner", async () => {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: lead.automationAgent.notifyEmail!,
            subject: `New qualified lead: ${lead.name}`,
            text: `${lead.name} (${lead.email}) just submitted a qualified lead.\n\nMessage: ${lead.message}\n\nAI reasoning: ${qualification.reasoning}`,
          }).catch(() => {}); // notification failure is non-critical, don't fail the job
        });
      }
    }

    return { qualified: qualification.qualified };
  }
);