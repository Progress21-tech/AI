import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InterviewState } from '@/lib/ai/types';
import { getInitialQuestion } from '@/lib/interview/engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/auth/server';

const schema = z.object({ companyName: z.string().trim().min(2).max(200), respondentName: z.string().trim().max(150).optional(), respondentRole: z.string().trim().max(150).optional(), respondentEmail: z.string().trim().email().max(254).optional(), respondentPhone: z.string().trim().max(40).optional() });

export async function POST(req: NextRequest) {
  try {
    const payload = schema.parse(await req.json());
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required to start an interview.' }, { status: 401 });
    const interviewId = crypto.randomUUID();
    const now = new Date().toISOString();
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    let companyId = '';
    {
      const slug = payload.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'company';
      const { data: company, error: companyError } = await supabase.from('companies').insert({ name: payload.companyName, slug: `${slug}-${Date.now()}`, owner_id: auth.user.id }).select('id').single();
      if (companyError || !company) return NextResponse.json({ error: companyError?.message || 'Unable to create company.' }, { status: 500 });
      companyId = company.id;
      const { error: interviewError } = await supabase.from('interviews').insert({ id: interviewId, company_id: companyId, created_by: auth.user.id, respondent_name: payload.respondentName, respondent_role: payload.respondentRole, respondent_email: payload.respondentEmail, respondent_phone: payload.respondentPhone, current_question_id: 'company_name', started_at: now, last_activity_at: now, target_duration_seconds: 900 });
      if (interviewError) return NextResponse.json({ error: interviewError.message }, { status: 500 });
      await supabase.from('interview_questions').insert({ interview_id: interviewId, question_key: 'company_name', question_text: getInitialQuestion().text, question_type: getInitialQuestion().type, sequence_number: 1 });
    }
    const state: InterviewState = { interviewId, companyId, phase: 'orientation', businessFacts: [], workflows: [], problems: [], unknowns: [], currentObjective: 'business_identity', questionsAsked: 0, startedAt: now, lastActivityAt: now, targetDurationSeconds: 900, elapsedSeconds: 0, estimatedRemainingSeconds: 900, timeMode: 'normal', answers: [], askedQuestionIds: ['company_name'], diagnosticSignals: [], selectedProcesses: [] };
    return NextResponse.json({ success: true, interviewId, companyId, state, decision: { action: 'ask_question', phase: 'orientation', objective: 'business_identity', timeMode: 'normal', question: getInitialQuestion(), confidence: 1 } });
  } catch (error: any) {
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Company name is required and must be valid.' : error.message || 'Failed to start discovery interview' }, { status: 400 });
  }
}
