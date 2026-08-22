/**
 * Outbound email.
 *
 * Sends over Resend's HTTP API rather than SMTP: Railway blocks outbound SMTP
 * ports on most plans, so an HTTP provider is the only thing that reliably
 * works there. No SDK — the API is a single POST, and this keeps the
 * dependency list unchanged.
 *
 * Configure with:
 *   RESEND_API_KEY   required to actually send
 *   EMAIL_FROM       e.g. "HubWeld <orders@hubweld.ca>" (must be a verified
 *                    sender domain in Resend)
 *   OPS_EMAIL        where new-order notifications go (defaults to EMAIL_FROM)
 *
 * Sending never throws into a request path. If the key is missing or the
 * provider fails, the message is logged and the caller continues — an order
 * must not be lost because email is down.
 */

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const FROM = process.env.EMAIL_FROM || "HubWeld <onboarding@resend.dev>";

export function opsAddress(): string {
  return process.env.OPS_EMAIL || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "";
}

export async function sendMail(mail: Mail): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = Array.isArray(mail.to) ? mail.to.filter(Boolean) : [mail.to].filter(Boolean);
  if (to.length === 0) return { ok: false, skipped: true, error: "no recipient" };

  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set — would have sent "${mail.subject}" to ${to.join(", ")}`);
    return { ok: false, skipped: true, error: "not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] send failed ${res.status}: ${body.slice(0, 300)}`);
      return { ok: false, error: `provider returned ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error(`[email] send threw: ${e?.message ?? e}`);
    return { ok: false, error: e?.message ?? "send failed" };
  }
}

/** Fire-and-forget: never let an email failure break the request. */
export async function sendMailSafe(mail: Mail): Promise<void> {
  try {
    await sendMail(mail);
  } catch (e: any) {
    console.error(`[email] unexpected: ${e?.message ?? e}`);
  }
}
