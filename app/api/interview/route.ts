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
      return NextResponse.json(
        { error: 'Invalid payload: missing interview state' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const reasoningResult = await aiProvider.processAnswerAndGetNextStep(
      state,
      answer,
      recentAnswers || []
    );
    const latencyMs = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date().toISOString(),
      phase: reasoningResult.phase,
      objective: reasoningResult.objective,
      latencyMs,
    };
    console.log('[OBSERVABILITY_LOG]', JSON.stringify(logEntry));

    return NextResponse.json({
      success: true,
      result: reasoningResult,
      latencyMs,
    });
  } catch (error: any) {
    console.error('Error processing interview answer:', error);
    return NextResponse.json(
      {
        error: "I'm having trouble generating the next question. Please try again.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
