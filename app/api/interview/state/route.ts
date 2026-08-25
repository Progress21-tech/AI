import { NextRequest, NextResponse } from 'next/server';
import { calculateServerTimer } from '@/lib/agent/timer';
import { InterviewState } from '@/lib/ai/types';
import { getAuthContext } from '@/lib/auth/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing interview ID' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: persisted } = supabase ? await supabase.from('interviews').select('id,status,current_question_id,started_at,last_activity_at,target_duration_seconds').eq('id', id).maybeSingle() : { data: null };
    if (!persisted) return NextResponse.json({ error: 'Interview not found or not authorized.' }, { status: 404 });
    // RLS has verified the row; timestamps remain the timer source of truth.
    const mockState: InterviewState = {
      interviewId: persisted.id,
      phase: 'orientation',
      businessFacts: [],
      workflows: [],
      problems: [],
      unknowns: [],
      currentObjective: 'establish_business_context',
      questionsAsked: 0,
      startedAt: persisted.started_at,
      lastActivityAt: persisted.last_activity_at,
      targetDurationSeconds: persisted.target_duration_seconds,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: persisted.target_duration_seconds,
      timeMode: 'normal',
    };

    const timeMetrics = calculateServerTimer(mockState);

    return NextResponse.json({
      success: true,
      state: {
        ...mockState,
        elapsedSeconds: timeMetrics.elapsedSeconds,
        estimatedRemainingSeconds: timeMetrics.estimatedRemainingSeconds,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
