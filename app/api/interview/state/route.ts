import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai/provider';
import { InterviewState } from '@/lib/ai/types';

const aiProvider = new AIProvider();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing interview ID' }, { status: 400 });
    }

    // In-memory or fallback state payload with server-authoritative time
    const mockState: InterviewState = {
      interviewId: id,
      phase: 'orientation',
      businessFacts: [],
      workflows: [],
      problems: [],
      unknowns: [],
      currentObjective: 'establish_business_context',
      questionsAsked: 1,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      targetDurationSeconds: 720,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 720,
      timeMode: 'normal',
    };

    const timeMetrics = aiProvider.calculateTimeMetrics(mockState);

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
