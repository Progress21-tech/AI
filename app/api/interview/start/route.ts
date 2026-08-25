import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai/provider';
import { InterviewState } from '@/lib/ai/types';

const aiProvider = new AIProvider();

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
      targetDurationSeconds: 720, // 12 minutes target budget
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 720,
      timeMode: 'normal',
    };

    // Dynamically generate the VERY FIRST question from AI
    const decision = await aiProvider.generateFirstQuestion(initialState);

    return NextResponse.json({
      success: true,
      interviewId,
      state: initialState,
      decision,
    });
  } catch (error: any) {
    console.error('Error in /api/interview/start:', error);
    return NextResponse.json(
      { error: 'Failed to start discovery interview', details: error.message },
      { status: 500 }
    );
  }
}
