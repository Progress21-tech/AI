import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { fixedQuestionByKey, fixedQuestions } from '@/lib/interview/fixedQuestions';

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing interview ID.' }, { status: 400 });
    const supabase = await createServiceRoleSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'The interview service is not configured.' }, { status: 503 });
    const { data: interview } = await supabase.from('interviews').select('status,current_question_id').eq('id', id).maybeSingle();
    if (!interview) return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    const question = interview.current_question_id ? fixedQuestionByKey.get(interview.current_question_id) ?? null : null;
    const questionNumber = question ? fixedQuestions.findIndex((item) => item.key === question.key) + 1 : fixedQuestions.length;
    return NextResponse.json({ question, questionNumber, totalQuestions: fixedQuestions.length, completed: interview.status === 'completed' || !question });
  } catch (error) {
    console.error('[interview/state]', error);
    return NextResponse.json({ error: 'We could not restore this interview.' }, { status: 500 });
  }
}
