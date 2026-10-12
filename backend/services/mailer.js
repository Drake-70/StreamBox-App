// Lightweight transactional email sender.
//
// Uses an HTTPS email API (Resend or Brevo) rather than SMTP so the Docker
// image needs no extra native dependency and `npm ci --omit=dev` stays
// reproducible. Configure ONE of:
//
//   RESEND_API_KEY   + MAIL_FROM_EMAIL / MAIL_FROM_NAME   (recommended)
//   BREVO_API_KEY    + MAIL_FROM_EMAIL / MAIL_FROM_NAME
//
// If nothing is configured, sendEmail() resolves false. Callers use that to
// fall back gracefully (e.g. auto-verify) instead of locking users out.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAIL_FROM_EMAIL =
  process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM || "onboarding@resend.dev";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "StreamBox";

function activeProvider() {
  if (RESEND_API_KEY) return "resend";
  if (BREVO_API_KEY) return "brevo";
  return null;
}

function isConfigured() {
  return activeProvider() !== null;
}

async function sendEmail({ to, subject, html, text }) {
  const provider = activeProvider();
  if (!provider) return false;

  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${MAIL_FROM_NAME} <${MAIL_FROM_EMAIL}>`,
          to: [to],
          subject,
          html,
          text,
        }),
      });
      if (!res.ok) {
        console.error("[mail] Resend error", res.status, (await res.text()).slice(0, 300));
      }
      return res.ok;
    }

    if (provider === "brevo") {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (!res.ok) {
        console.error("[mail] Brevo error", res.status, (await res.text()).slice(0, 300));
      }
      return res.ok;
    }
  } catch (err) {
    console.error("[mail] send failed:", err.message);
    return false;
  }
  return false;
}

function codeEmail(code, intro) {
  const subject = `${code} is your StreamBox code`;
  const text = `${intro}\n\nYour code is ${code}. It expires in 10 minutes.`;
  const html = `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f5f5;border-radius:16px">
    <h1 style="margin:0 0 8px;font-size:22px">Stream<span style="color:#f0d06a">Box</span></h1>
    <p style="color:#b9b9b9;margin:0 0 20px">${intro}</p>
    <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:16px;border-radius:12px;background:#141414;border:1px solid #262626">${code}</div>
    <p style="color:#8a8a8a;font-size:13px;margin:20px 0 0">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
  </div>`;
  return { subject, text, html };
}

async function sendVerificationCode(to, code) {
  const ok = await sendEmail({ to, ...codeEmail(code, "Confirm your email to finish setting up your StreamBox account.") });
  if (!ok) {
    console.warn(
      `[mail] No email provider configured. Verification code for ${to} is: ${code}`
    );
  }
  return ok;
}

async function sendPasswordResetCode(to, code) {
  const ok = await sendEmail({ to, ...codeEmail(code, "Use this code to reset your StreamBox password.") });
  if (!ok) {
    console.warn(
      `[mail] No email provider configured. Password reset code for ${to} is: ${code}`
    );
  }
  return ok;
}

module.exports = { sendVerificationCode, sendPasswordResetCode, isConfigured };
