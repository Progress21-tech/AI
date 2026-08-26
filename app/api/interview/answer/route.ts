import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { fixedQuestionByKey, fixedQuestions } from '@/lib/interview/fixedQuestions';

const schema = z.object({
  interviewId: z.string().uuid(),
  questionKey: z.string(),
  answerText: z.string().trim().max(10000).optional(),
  selectedOptions: z.array(z.string().max(500)).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = schema.parse(await req.json());
    const questionIndex = fixedQuestions.findIndex((item) => item.key === payload.questionKey);
    if (questionIndex < 0 || !fixedQuestionByKey.has(payload.questionKey)) throw new Error('Invalid question.');
    const answerText = payload.answerText?.trim() || payload.selectedOptions?.join(', ') || '';
    if (!answerText && payload.questionKey !== 'website') return NextResponse.json({ error: 'Please provide an answer before continuing.' }, { status: 400 });
    const supabase = await createServiceRoleSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'The interview service is not configured. Please try again later.' }, { status: 503 });
    const { data: interview } = await supabase.from('interviews').select('id,company_id,status').eq('id', payload.interviewId).maybeSingle();
    if (!interview || interview.status !== 'in_progress') return NextResponse.json({ error: 'This interview is no longer available.' }, { status: 404 });
    const { data: snapshot } = await supabase.from('interview_questions').select('id').eq('interview_id', payload.interviewId).eq('question_key', payload.questionKey).maybeSingle();
    if (!snapshot) throw new Error('Question snapshot was not found.');
    const { data: prior } = await supabase.from('answers').select('id').eq('interview_id', payload.interviewId).eq('question_id', snapshot.id).maybeSingle();
    const answer = { answer_text: answerText || null, answer_json: { selectedOptions: payload.selectedOptions ?? [] } };
    const answerResult = prior ? await supabase.from('answers').update(answer).eq('id', prior.id) : await supabase.from('answers').insert({ interview_id: payload.interviewId, question_id: snapshot.id, ...answer });
    if (answerResult.error) throw answerResult.error;
    if (payload.questionKey === 'industry') await supabase.from('companies').update({ industry: answerText }).eq('id', interview.company_id);
    if (payload.questionKey === 'company_size') await supabase.from('companies').update({ size: answerText }).eq('id', interview.company_id);
    if (payload.questionKey === 'website' && answerText) await supabase.from('companies').update({ website: answerText }).eq('id', interview.company_id);
    const next = fixedQuestions[questionIndex + 1];
    const completed = !next;
    const update = await supabase.from('interviews').update({ current_question_id: next?.key ?? null, last_activity_at: new Date().toISOString(), status: completed ? 'completed' : 'in_progress', completed_at: completed ? new Date().toISOString() : null }).eq('id', payload.interviewId);
    if (update.error) throw update.error;
    return NextResponse.json({ success: true, completed, question: next ?? null, questionNumber: questionIndex + 2, totalQuestions: fixedQuestions.length });
  } catch (error) {
    console.error('[interview/answer]', error);
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Your answer could not be understood. Please try again.' : 'We could not save your answer. Please try again.' }, { status: 500 });
  }
}
