// FEATURE: Password reset email
import { resend, EMAIL_FROM } from "./resend";

export async function sendResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Reset your Docent password",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="margin: 0 0 12px;">Reset your password</h2>
          <p style="color: #555; line-height: 1.5;">
            Click below to set a new password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #f2a93b;
                    color: #0b0e14; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset password
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send reset email:", err);
    return { sent: false };
  }
}