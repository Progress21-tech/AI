import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAgent } from '@/lib/agent/runtime';
import { InterviewState, AnswerRecord } from '@/lib/ai/types';

const answerSchema = z.object({
    state: z.object({
        interviewId: z.string().min(1),
        phase: z.string().optional(),
        targetDurationSeconds: z.number().optional(),
    }),
    answer: z.object({
        id: z.string().min(1),
        questionId: z.string().min(1),
        questionText: z.string().min(1).max(2000),
        answerText: z.string().max(5000).optional(),
        selectedOptions: z.array(z.string()).max(50).optional(),
        timestamp: z.string().datetime().optional(),
    }),
    recentAnswers: z.array(z.any()).max(200).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const payload = answerSchema.parse(body);

        const updatedState: InterviewState = {
            ...payload.state,
            lastActivityAt: new Date().toISOString(),
            questionsAsked: (payload.state as any).questionsAsked ?? 1,
        } as InterviewState;

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
                    sequence: finalState.questionsAsked,
                } : null,
                confidence: response.confidence,
            },
            updatedTimeMetrics: {
                elapsedSeconds: finalState.elapsedSeconds,
                estimatedRemainingSeconds: finalState.estimatedRemainingSeconds,
            },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Answer payload is invalid.', details: error.flatten() },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "I'm having trouble generating the next question. Please try again.", details: error.message },
            { status: 500 }
        );
    }
}
