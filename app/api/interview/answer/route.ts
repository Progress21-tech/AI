import { NextRequest, NextResponse } from 'next/server';
import { AnswerRecord, InterviewState } from '@/lib/ai/types';
import { buildAnalysisPayload, diagnosticSignals, getNextQuestion, isComplete } from '@/lib/interview/engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { state, answer } = await req.json() as { state: InterviewState; answer: AnswerRecord };
    if (!state || !answer) return NextResponse.json({ error: 'Missing interview state or answer' }, { status: 400 });
    const now = new Date();
    const elapsedSeconds = Math.max(0, Math.round((now.getTime() - new Date(state.startedAt).getTime()) / 1000));
    const answers = [...(state.answers ?? []), answer];
    const signals = diagnosticSignals(Object.fromEntries(answers.map((item) => [item.questionId, item.selectedOptions?.map((option) => option.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')) ?? []])));
    const answerValue = answer.selectedOptions?.length ? answer.selectedOptions : [answer.answerText ?? ''];
    const businessFacts = [...state.businessFacts.filter((fact) => fact.key !== answer.questionId), { id: answer.id, category: answer.questionId === 'software' ? 'tools' : answer.questionId, key: answer.questionId, value: answerValue.join(', '), confidence: 1, sourceAnswerId: answer.id }];
    const currentProblem = answer.questionId === 'biggest_problem' && answer.answerText
      ? { id: `problem-${state.interviewId}`, title: answer.answerText, description: answer.answerText, category: 'operations', affectedPeople: [], frequency: null, severity: null, timeImpact: null, financialImpact: null, customerImpact: null, currentWorkaround: null, rootCause: null, confidence: 1, status: 'investigating' as const, evidenceIds: [answer.id] }
      : null;
    const updatedState: InterviewState = { ...state, answers, businessFacts, problems: currentProblem ? [...state.problems, currentProblem] : state.problems, questionsAsked: answers.length, lastActivityAt: now.toISOString(), elapsedSeconds, estimatedRemainingSeconds: Math.max(0, state.targetDurationSeconds - elapsedSeconds), askedQuestionIds: state.askedQuestionIds ?? [], diagnosticSignals: signals, selectedProcesses: answers.find((item) => item.questionId === 'core_processes')?.selectedOptions ?? state.selectedProcesses };
    const complete = isComplete(updatedState);
    const next = complete ? null : getNextQuestion(updatedState);
    if (next) updatedState.askedQuestionIds = [...(updatedState.askedQuestionIds ?? []), next.id];
    updatedState.phase = complete ? 'validation' : next?.phase ?? 'validation';
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: snapshot } = await supabase.from('interview_questions').select('id').eq('interview_id', state.interviewId).eq('question_key', answer.questionId).order('sequence_number', { ascending: false }).limit(1).maybeSingle();
      if (snapshot) await supabase.from('answers').insert({ interview_id: state.interviewId, question_id: snapshot.id, answer_text: answer.answerText ?? null, answer_json: { selectedOptions: answer.selectedOptions ?? [] } });
      await supabase.from('business_facts').insert(signals.map((signal) => ({ interview_id: state.interviewId, category: 'diagnostic_signal', key: signal, value: true })));
      if (answer.questionId === 'biggest_problem' && answer.answerText) await supabase.from('problems').insert({ interview_id: state.interviewId, title: answer.answerText, description: answer.answerText });
      if (answer.questionId === 'problem_frequency') await supabase.from('problems').update({ frequency: answer.selectedOptions?.[0] ?? answer.answerText ?? null }).eq('interview_id', state.interviewId);
      if (answer.questionId === 'problem_severity') await supabase.from('problems').update({ severity: Number((answer.selectedOptions?.[0] ?? answer.answerText ?? '').match(/\d/)?.[0] ?? 0) || null }).eq('interview_id', state.interviewId);
      if (answer.questionId === 'problem_time_impact') await supabase.from('problems').update({ time_impact_hours_per_week: answer.selectedOptions?.[0]?.includes('20+') ? 20 : answer.selectedOptions?.[0]?.includes('10') ? 10 : answer.selectedOptions?.[0]?.includes('5') ? 5 : null }).eq('interview_id', state.interviewId);
      if (answer.questionId === 'problem_workaround') await supabase.from('problems').update({ current_solution: answer.answerText ?? null }).eq('interview_id', state.interviewId);
      if (next) await supabase.from('interview_questions').insert({ interview_id: state.interviewId, question_key: next.id, question_text: next.text, question_type: next.type, sequence_number: next.sequence });
      await supabase.from('interviews').update({ current_question_id: next?.id ?? null, last_activity_at: now.toISOString(), status: complete ? 'analysis_pending' : 'in_progress', completed_at: complete ? now.toISOString() : null }).eq('id', state.interviewId);
    }
    return NextResponse.json({ success: true, state: updatedState, decision: { action: complete ? 'validate_summary' : 'ask_question', phase: updatedState.phase, objective: next?.objective ?? 'completion', timeMode: elapsedSeconds >= state.targetDurationSeconds ? 'wrap_up' : 'normal', question: next, confidence: 1 }, updatedTimeMetrics: { elapsedSeconds, estimatedRemainingSeconds: updatedState.estimatedRemainingSeconds }, analysisPayload: complete ? buildAnalysisPayload(updatedState) : undefined });
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Unable to save answer' }, { status: 500 }); }
}
