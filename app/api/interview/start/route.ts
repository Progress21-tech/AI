import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { fixedQuestions } from '@/lib/interview/fixedQuestions';

const schema = z.object({ companyName: z.string().trim().min(2).max(200), respondentName: z.string().trim().max(150).optional(), respondentRole: z.string().trim().max(150).optional(), respondentEmail: z.string().trim().email().max(254).optional(), respondentPhone: z.string().trim().max(40).optional() });

export async function POST(req: NextRequest) {
  try {
    const payload = schema.parse(await req.json());
    const interviewId = crypto.randomUUID();
    const now = new Date().toISOString();
    const supabase = await createServiceRoleSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'The interview service is not configured. Please try again later.' }, { status: 503 });
    const { data: existing } = await supabase.from('companies').select('id').ilike('name', payload.companyName).limit(1).maybeSingle();
    let companyId = existing?.id;
    if (!companyId) {
      const slug = payload.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'company';
      const { data: company, error } = await supabase.from('companies').insert({ name: payload.companyName, slug: `${slug}-${Date.now()}` }).select('id').single();
      if (error || !company) throw error ?? new Error('Unable to create the company.');
      companyId = company.id;
    }
    const { error: interviewError } = await supabase.from('interviews').insert({ id: interviewId, company_id: companyId, respondent_name: payload.respondentName, respondent_role: payload.respondentRole, respondent_email: payload.respondentEmail, respondent_phone: payload.respondentPhone, current_question_id: fixedQuestions[0].key, started_at: now, last_activity_at: now, target_duration_seconds: 900 });
    if (interviewError) throw interviewError;
    const { error: questionError } = await supabase.from('interview_questions').insert(fixedQuestions.map((question, index) => ({ interview_id: interviewId, question_key: question.key, question_text: question.text, question_type: question.type, sequence_number: index + 1 })));
    if (questionError) throw questionError;
    return NextResponse.json({ success: true, interviewId, companyId, question: fixedQuestions[0], questionNumber: 1, totalQuestions: fixedQuestions.length });
  } catch (error: any) {
    console.error('[interview/start]', error);
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Company name is required and must be valid.' : 'We could not start your interview. Please try again.' }, { status: 400 });
  }
}
