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
    if (questionIndex < 0 || !fixedQuestionByKey.has(payload.questionKey)) return NextResponse.json({ error: 'This question is not available. Please refresh and try again.' }, { status: 400 });
    const answerText = payload.answerText?.trim() || payload.selectedOptions?.join(', ') || '';
    if (!answerText && payload.questionKey !== 'website') return NextResponse.json({ error: 'Please provide an answer before continuing.' }, { status: 400 });
    const supabase = await createServiceRoleSupabaseClient();
    if (!supabase) {
      console.error('[interview/answer] SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json({ error: 'The response-saving service is temporarily unavailable. Please try again shortly.', code: 'PERSISTENCE_NOT_CONFIGURED' }, { status: 503 });
    }
    const { data: interview } = await supabase.from('interviews').select('id,company_id,status').eq('id', payload.interviewId).maybeSingle();
    if (!interview || interview.status !== 'in_progress') return NextResponse.json({ error: 'This interview is no longer available.' }, { status: 404 });
    const { data: snapshot } = await supabase.from('interview_questions').select('id').eq('interview_id', payload.interviewId).eq('question_key', payload.questionKey).maybeSingle();
    if (!snapshot) {
      console.error('[interview/answer] question snapshot missing', { interviewId: payload.interviewId, questionKey: payload.questionKey });
      return NextResponse.json({ error: 'We could not match this question to your interview. Please refresh and try again.' }, { status: 409 });
    }
    const { data: prior } = await supabase.from('answers').select('id').eq('interview_id', payload.interviewId).eq('question_id', snapshot.id).maybeSingle();
    const answer = { answer_text: answerText || null, answer_json: { selectedOptions: payload.selectedOptions ?? [] } };
    const answerResult = prior ? await supabase.from('answers').update(answer).eq('id', prior.id) : await supabase.from('answers').insert({ interview_id: payload.interviewId, question_id: snapshot.id, ...answer });
    if (answerResult.error) {
      console.error('[interview/answer] answer write failed', { code: answerResult.error.code, message: answerResult.error.message, details: answerResult.error.details, interviewId: payload.interviewId, questionId: snapshot.id });
      return NextResponse.json({ error: 'We could not save your answer. Please try again.', code: 'ANSWER_WRITE_FAILED' }, { status: 500 });
    }
    if (payload.questionKey === 'industry') await supabase.from('companies').update({ industry: answerText }).eq('id', interview.company_id);
    if (payload.questionKey === 'company_size') await supabase.from('companies').update({ size: answerText }).eq('id', interview.company_id);
    if (payload.questionKey === 'website' && answerText) await supabase.from('companies').update({ website: answerText }).eq('id', interview.company_id);
    const next = fixedQuestions[questionIndex + 1];
    const completed = !next;
    const update = await supabase.from('interviews').update({ current_question_id: next?.key ?? null, last_activity_at: new Date().toISOString(), status: completed ? 'completed' : 'in_progress', completed_at: completed ? new Date().toISOString() : null }).eq('id', payload.interviewId);
    if (update.error) {
      console.error('[interview/answer] interview progress update failed', { code: update.error.code, message: update.error.message, interviewId: payload.interviewId });
      return NextResponse.json({ error: 'Your answer was saved, but we could not load the next question. Please refresh this page.', code: 'PROGRESS_UPDATE_FAILED' }, { status: 500 });
    }
    return NextResponse.json({ success: true, completed, question: next ?? null, questionNumber: questionIndex + 2, totalQuestions: fixedQuestions.length });
  } catch (error) {
    console.error('[interview/answer] unexpected failure', error);
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Your answer could not be understood. Please try again.' : 'We could not save your answer. Please try again.' }, { status: 500 });
  }
}
