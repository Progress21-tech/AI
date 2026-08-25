import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAgent } from '@/lib/agent/runtime';
import { InterviewState } from '@/lib/ai/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const startInterviewSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  respondentName: z.string().trim().max(150).optional().transform((value) => value || undefined),
  respondentRole: z.string().trim().max(150).optional().transform((value) => value || undefined),
  respondentEmail: z.string().trim().email().max(254).optional().transform((value) => value || undefined),
  respondentPhone: z.string().trim().max(40).optional().transform((value) => value || undefined),
});

async function ensureCompanyRecord(payload: {
  companyName: string;
  respondentName?: string;
  respondentRole?: string;
  respondentEmail?: string;
  respondentPhone?: string;
}) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { companyId: `local-company-${Date.now()}` };
  }

  const normalizedName = payload.companyName.trim();
  const normalizedSlug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'company';

  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id, name')
    .ilike('name', normalizedName)
    .limit(1)
    .maybeSingle();

  if (existingCompany) {
    return { companyId: existingCompany.id };
  }

  const { data: createdCompany, error } = await supabase
    .from('companies')
    .insert({
      name: normalizedName,
      slug: normalizedSlug,
      industry: null,
      website: null,
      size: null,
    })
    .select('id')
    .single();

  if (error || !createdCompany) {
    return { companyId: `local-company-${Date.now()}` };
  }

  return { companyId: createdCompany.id };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = startInterviewSchema.parse(body);

    const companyRecord = await ensureCompanyRecord(payload);
    const interviewId = crypto.randomUUID();
    const nowISO = new Date().toISOString();

    const initialState: InterviewState = {
      interviewId,
      phase: 'orientation',
      businessFacts: [],
      workflows: [],
      problems: [],
      unknowns: [],
      currentObjective: 'establish_business_context',
      questionsAsked: 1,
      startedAt: nowISO,
      lastActivityAt: nowISO,
      targetDurationSeconds: 720,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 720,
      timeMode: 'normal',
    };

    const { response, updatedState } = await runAgent(initialState);

    return NextResponse.json({
      success: true,
      interviewId,
      companyId: companyRecord.companyId,
      state: updatedState,
      decision: {
        action: response.action,
        phase: response.phase,
        objective: response.objective,
        timeMode: response.timer.mode,
        question: response.question ? {
          id: 'q-1',
          text: response.question.text,
          type: response.question.type,
          options: response.question.options,
          required: true,
          objective: response.objective,
          category: response.phase,
          phase: response.phase,
          sequence: 1,
        } : null,
        confidence: response.confidence,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/interview/start:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Company name is required and must be valid.', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start discovery interview', details: error.message },
      { status: 500 }
    );
  }
}
