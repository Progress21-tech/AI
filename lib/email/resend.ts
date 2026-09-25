import 'server-only';

type EmailMessage = { to: string; subject: string; text: string };

/** Sends one idempotent transactional email through Resend's HTTP API. */
export async function sendResendEmail(message: EmailMessage, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('Email is not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text }),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = typeof result?.message === 'string' ? result.message : `Resend returned HTTP ${response.status}.`;
    throw new Error(reason);
  }
  return result;
}
