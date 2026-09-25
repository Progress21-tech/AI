import type { SupabaseClient } from '@supabase/supabase-js';
import { sendResendEmail } from './resend';

export type DiscoveryCallRequest = {
  id: string;
  name: string;
  business_name: string;
  email: string;
  whatsapp: string | null;
  business_description: string;
  biggest_problem: string;
  preferred_call_datetime: string;
  interested_service: string;
  source: string;
  discovery_answers: Record<string, unknown>;
  confirmation_email_attempts: number;
  owner_email_attempts: number;
};

type DeliveryKind = 'confirmation' | 'owner';
const MAX_ATTEMPTS = 8;

const displayDate = (date: string) => new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Lagos',
}).format(new Date(date));

function messageFor(request: DiscoveryCallRequest, kind: DeliveryKind) {
  if (kind === 'confirmation') {
    return {
      to: request.email,
      subject: `We've received your request, ${request.name}`,
      text: `Hi ${request.name}, thanks for reaching out to ProbeTech. We've received your request for a discovery call on ${displayDate(request.preferred_call_datetime)} and will confirm the slot within 24 hours. To make the call useful, think about which task costs your team the most time and what you've already tried.\nTalk soon,\nProgress, ProbeTech`,
    };
  }

  const owner = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!owner) throw new Error('Email is not configured: set OWNER_NOTIFICATION_EMAIL.');
  const discovery = Object.entries(request.discovery_answers ?? {})
    .map(([question, answer]) => `${question}: ${Array.isArray(answer) ? answer.join(', ') : String(answer)}`)
    .join('\n');
  return {
    to: owner,
    subject: `New discovery call request: ${request.business_name}`,
    text: [
      'A new discovery call request was submitted.',
      `Name: ${request.name}`,
      `Business: ${request.business_name}`,
      `Email: ${request.email}`,
      `WhatsApp: ${request.whatsapp || 'Not provided'}`,
      `What the business does: ${request.business_description}`,
      `Biggest problem: ${request.biggest_problem}`,
      `Preferred call time: ${displayDate(request.preferred_call_datetime)}`,
      `Interested service: ${request.interested_service}`,
      `Source: ${request.source}`,
      'Additional discovery answers:',
      discovery || 'No additional answers',
    ].join('\n\n'),
  };
}

/** Persist each attempt and error beside the submission before retrying. */
export async function deliverRequestEmail(db: SupabaseClient, request: DiscoveryCallRequest, kind: DeliveryKind, attemptsThisRun = 3) {
  const statusColumn = kind === 'confirmation' ? 'confirmation_email_status' : 'owner_email_status';
  const attemptsColumn = kind === 'confirmation' ? 'confirmation_email_attempts' : 'owner_email_attempts';
  const errorColumn = kind === 'confirmation' ? 'confirmation_email_last_error' : 'owner_email_last_error';
  let attempts = request[attemptsColumn];
  let lastError: string | null = null;

  const stopAfter = Math.min(MAX_ATTEMPTS, attempts + attemptsThisRun);
  while (attempts < stopAfter) {
    attempts += 1;
    try {
      await sendResendEmail(messageFor(request, kind), `discovery-call/${request.id}/${kind}`);
      const { error } = await db.from('discovery_call_requests').update({
        [statusColumn]: 'sent', [attemptsColumn]: attempts, [errorColumn]: null,
      }).eq('id', request.id);
      if (error) throw error;
      return { sent: true, attempts };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown email delivery error.';
      const finalFailure = attempts >= MAX_ATTEMPTS;
      const { error: logError } = await db.from('discovery_call_requests').update({
        [statusColumn]: finalFailure ? 'failed' : 'pending',
        [attemptsColumn]: attempts,
        [errorColumn]: lastError.slice(0, 2000),
        email_retry_after: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', request.id);
      if (logError) console.error('[discovery-call/email-log]', request.id, kind, logError.message);
      console.error('[discovery-call/email]', request.id, kind, lastError);
      if (finalFailure) return { sent: false, attempts, error: lastError };
      await new Promise((resolve) => setTimeout(resolve, attempts * 250));
    }
  }
  return { sent: false, attempts, error: lastError };
}

export function hasPendingEmails(request: DiscoveryCallRequest & Record<string, unknown>) {
  return request.confirmation_email_status === 'pending' || request.owner_email_status === 'pending';
}
