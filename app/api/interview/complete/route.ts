import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({ interviewId: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const { interviewId } = schema.parse(await req.json());
    const supabase = await createServiceRoleSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'The interview service is not configured.' }, { status: 503 });
    const { error } = await supabase.from('interviews').update({ status: 'completed', completed_at: new Date().toISOString(), current_question_id: null }).eq('id', interviewId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[interview/complete]', error);
    return NextResponse.json({ error: 'We could not complete your interview. Please try again.' }, { status: 500 });
  }
}
