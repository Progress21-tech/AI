import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent/runtime';
import { InterviewState, AnswerRecord } from '@/lib/ai/types';
import { getAuthContext } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
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
    const stateForRun: InterviewState = {
      ...state,
      lastActivityAt: new Date().toISOString(),
      questionsAsked: state.questionsAsked + (answer ? 1 : 0),
    };
    const { response } = await runAgent(stateForRun);
    const latencyMs = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date().toISOString(),
      phase: response.phase,
      objective: response.objective,
      latencyMs,
    };
    console.log('[OBSERVABILITY_LOG]', JSON.stringify(logEntry));

    return NextResponse.json({
      success: true,
      result: response,
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
