import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deliverRequestEmail, type DiscoveryCallRequest } from '@/lib/email/discoveryCallEmails';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({
  name: z.string().trim().min(1).max(150),
  business_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().max(40).nullable().optional(),
  business_description: z.string().trim().min(1).max(3000),
  biggest_problem: z.string().trim().min(1).max(5000),
  preferred_call_datetime: z.string().datetime(),
  interested_service: z.enum(['automation', 'chatbot', 'custom_software', 'unsure']),
  source: z.string().trim().min(1).max(100).default('website'),
  discovery_answers: z.record(z.union([z.string().max(1000), z.array(z.string().max(300)).max(30)])).default({}),
});

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Please check the required fields and try again.' : 'We could not read this request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = await createServiceRoleSupabaseClient();
  if (!db) {
    console.error('[discovery-call] Supabase server credentials are not configured.');
    return NextResponse.json({ error: 'The request service is temporarily unavailable. Please try again later.' }, { status: 503 });
  }

  const { data, error } = await db.from('discovery_call_requests').insert({
    ...payload,
    whatsapp: payload.whatsapp || null,
    status: 'new',
    email_lock_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  }).select('*').single();

  if (error || !data) {
    console.error('[discovery-call/save]', error?.message ?? 'No request row returned.');
    return NextResponse.json({ error: 'We could not save your request. Please try again.' }, { status: 503 });
  }

  // The lead is durable before we call Resend; mail failures are logged on this row for retry.
  const savedRequest = data as DiscoveryCallRequest;
  const confirmation = await deliverRequestEmail(db, savedRequest, 'confirmation');
  await deliverRequestEmail(db, savedRequest, 'owner');
  await db.from('discovery_call_requests').update({ email_lock_until: null }).eq('id', savedRequest.id);

  return NextResponse.json({ success: true, confirmationSent: confirmation.sent }, { status: 201 });
}
