import { NextRequest, NextResponse } from 'next/server';
import { generateAIReport } from '@/lib/ai/ai-reporting';
import { generateDiscoveryReport, generateValidationSummary } from '@/lib/ai/reporting';
import { InterviewState } from '@/lib/ai/types';
import { buildAnalysisPayload } from '@/lib/interview/engine';
import { getAuthContext } from '@/lib/auth/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const body = await req.json();
    const { action, state, validationChoice, correctionText } = body as {
      action: 'get_validation' | 'generate_report';
      state: InterviewState;
      validationChoice?: string;
      correctionText?: string;
    };

    if (!state) {
      return NextResponse.json({ error: 'Missing interview state' }, { status: 400 });
    }

    if (action === 'get_validation') {
      const summary = generateValidationSummary(state);
      return NextResponse.json({ success: true, summary });
    }

    if (action === 'generate_report') {
      const supabase = await createServerSupabaseClient();
      if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

      const [{ data: company }, { data: questions }] = await Promise.all([
        state.companyId
          ? supabase.from('companies').select('id,name,industry,website,size').eq('id', state.companyId).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from('interview_questions').select('id,question_key,question_text,question_type,sequence_number,answers(id,answer_text,answer_json,created_at)').eq('interview_id', state.interviewId).order('sequence_number', { ascending: true }),
      ]);

      let report;
      let source: 'ai' | 'fallback' = 'ai';
      let recommendations: Array<Record<string, unknown>> = [];
      let rawOutput: unknown = null;

      try {
        const aiResult = await generateAIReport({
          state,
          company,
          questions: questions ?? [],
          answers: state.answers ?? [],
          businessFacts: state.businessFacts,
          workflows: state.workflows,
          problems: state.problems,
          desiredOutcome: state.answers?.find((answer) => answer.questionId === 'desired_outcome')?.answerText ?? null,
          validationChoice,
          correctionText,
        });
        report = aiResult.report;
        recommendations = aiResult.recommendations.map((recommendation) => ({
          title: recommendation.title,
          type: recommendation.type,
          problem_solved: recommendation.problemSolved,
          evidence: recommendation.evidence,
          why_it_matters: recommendation.whyItMatters,
          expected_impact: recommendation.expectedImpact,
          priority: recommendation.priority,
          implementation_difficulty: recommendation.implementationDifficulty,
          suggested_approach: recommendation.suggestedApproach,
          next_step: recommendation.nextStep,
        }));
        rawOutput = aiResult.rawOutput;
      } catch (error) {
        source = 'fallback';
        console.warn('[AI_REPORT] fallback_activated', {
          interviewId: state.interviewId,
          reason: error instanceof Error && error.name === 'ZodError' ? 'validation_failure' : 'provider_failure',
        });
        report = { ...generateDiscoveryReport(state, validationChoice, correctionText), source };
      }

      const service = await createServiceRoleSupabaseClient();
      if (!service) return NextResponse.json({ error: 'Server persistence is not configured.' }, { status: 503 });
      const { error: reportError } = await service.from('reports').insert({
        interview_id: state.interviewId,
        executive_summary: report.executiveSummary,
        business_snapshot: report.businessProfile,
        major_problems: report.rankedProblems,
        opportunities: report.recommendations ?? report.opportunityValidation,
        roadmap: report.implementationRoadmap ?? report.opportunityValidation,
        raw_ai_output: { source, output: rawOutput ?? report },
      });
      if (reportError) throw reportError;

      if (source === 'ai' && recommendations.length > 0) {
        const { error: recommendationError } = await service.from('recommendations').insert(
          recommendations.map((recommendation) => ({ interview_id: state.interviewId, ...recommendation }))
        );
        if (recommendationError) throw recommendationError;
      }

      await service.from('interviews').update({ status: source === 'ai' ? 'analyzed' : 'completed', completed_at: new Date().toISOString() }).eq('id', state.interviewId);
      return NextResponse.json({ success: true, source, report, analysisPayload: buildAnalysisPayload(state) });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/interview/complete:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
