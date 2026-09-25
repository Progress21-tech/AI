import { NextRequest, NextResponse } from 'next/server';
import { deliverRequestEmail, type DiscoveryCallRequest } from '@/lib/email/discoveryCallEmails';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await createServiceRoleSupabaseClient();
  if (!db) return NextResponse.json({ error: 'Supabase server credentials are not configured.' }, { status: 503 });

  const now = new Date().toISOString();
  const { data, error } = await db.from('discovery_call_requests')
    .select('*')
    .lte('email_retry_after', now)
    .or('confirmation_email_status.eq.pending,owner_email_status.eq.pending')
    .order('email_retry_after', { ascending: true })
    .limit(25);
  if (error) {
    console.error('[discovery-call/retry-query]', error.message);
    return NextResponse.json({ error: 'Could not load pending email retries.' }, { status: 503 });
  }

  let processed = 0;
  for (const row of data ?? []) {
    const record = row as DiscoveryCallRequest & { confirmation_email_status: string; owner_email_status: string; email_lock_until: string | null };
    const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    let claim = db.from('discovery_call_requests').update({ email_lock_until: lockExpiry }).eq('id', record.id);
    claim = record.email_lock_until
      ? claim.eq('email_lock_until', record.email_lock_until)
      : claim.is('email_lock_until', null);
    const { data: claimed, error: claimError } = await claim.select('id').maybeSingle();
    if (claimError || !claimed) continue;

    if (record.confirmation_email_status === 'pending') await deliverRequestEmail(db, record, 'confirmation');
    if (record.owner_email_status === 'pending') await deliverRequestEmail(db, record, 'owner');
    await db.from('discovery_call_requests').update({ email_lock_until: null }).eq('id', record.id);
    processed += 1;
  }

  return NextResponse.json({ processed });
}
