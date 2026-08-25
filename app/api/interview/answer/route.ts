import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent/runtime';
import { InterviewState, AnswerRecord } from '@/lib/ai/types';

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
      questionsAsked: state.questionsAsked + 1
    };

    // Execute provider-agnostic agent runtime
    const { response, updatedState: finalState } = await runAgent(updatedState);

    return NextResponse.json({
      success: true,
      decision: {
        action: response.action,
        phase: response.phase,
        objective: response.objective,
        timeMode: response.timer.mode,
        question: response.question ? {
          id: `q-${finalState.questionsAsked}`,
          text: response.question.text,
          type: response.question.type,
          options: response.question.options,
          required: true,
          objective: response.objective,
          category: response.phase,
          phase: response.phase,
          sequence: finalState.questionsAsked
        } : null,
        confidence: response.confidence
      },
      updatedTimeMetrics: {
        elapsedSeconds: finalState.elapsedSeconds,
        estimatedRemainingSeconds: finalState.estimatedRemainingSeconds,
      },
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
