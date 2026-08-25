import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent/runtime';
import { InterviewState } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const interviewId = `int-${Date.now()}`;
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

    // Execute provider-agnostic agent runtime
    const { response, updatedState } = await runAgent(initialState);

    return NextResponse.json({
      success: true,
      interviewId,
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
          sequence: 1
        } : null,
        confidence: response.confidence
      },
    });
  } catch (error: any) {
    console.error('Error in /api/interview/start:', error);
    return NextResponse.json(
      { error: 'Failed to start discovery interview', details: error.message },
      { status: 500 }
    );
  }
}
