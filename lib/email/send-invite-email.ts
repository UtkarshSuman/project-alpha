// ============================================================================
// FEATURE: Invite email — sent when someone is invited to a workspace.
// Best-effort: if sending fails (bad API key, rate limit, etc.), the invite
// itself is NOT rolled back — the shareable link still works and is still
// shown in the UI as a fallback, so email delivery failures never block the
// actual invite feature from working.
// ============================================================================

import { resend, EMAIL_FROM } from "./resend";

export async function sendInviteEmail({
  to,
  orgName,
  inviteUrl,
  role,
}: {
  to: string;
  orgName: string;
  inviteUrl: string;
  role: string;
}) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `You've been invited to join ${orgName} on Docent`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="margin: 0 0 12px;">Join ${orgName}</h2>
          <p style="color: #555; line-height: 1.5;">
            You've been invited as a <strong>${role.toLowerCase()}</strong> on Docent, a platform for building
            custom AI chatbots from your documents.
          </p>
          <a href="${inviteUrl}"
             style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #f2a93b;
                    color: #0b0e14; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Accept invite
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            This invite expires in 7 days. If you weren't expecting this, you can ignore this email.
          </p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send invite email:", err);
    return { sent: false };
  }
}