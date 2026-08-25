import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai/provider';
import { InterviewState, AnswerRecord } from '@/lib/ai/types';

const aiProvider = new AIProvider();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, answer, recentAnswers } = body as {
      state: InterviewState;
      answer?: AnswerRecord;
      recentAnswers?: AnswerRecord[];
    };

    if (!state) {
      return NextResponse.json({ error: 'Missing interview state' }, { status: 400 });
    }

    const updatedState: InterviewState = {
      ...state,
      lastActivityAt: new Date().toISOString(),
    };

    // Calculate server-authoritative timer metrics
    const timeMetrics = aiProvider.calculateTimeMetrics(updatedState);
    updatedState.elapsedSeconds = timeMetrics.elapsedSeconds;
    updatedState.estimatedRemainingSeconds = timeMetrics.estimatedRemainingSeconds;

    const decision = await aiProvider.processAnswerAndGetNextStep(
      updatedState,
      answer,
      recentAnswers || []
    );

    return NextResponse.json({
      success: true,
      decision,
      updatedTimeMetrics: timeMetrics,
    });
  } catch (error: any) {
    console.error('Error in /api/interview/answer:', error);
    return NextResponse.json(
      { 
        error: "I'm having trouble generating the next question. Please try again.",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
