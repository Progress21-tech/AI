import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patchInterviewSchema = z.object({
    status: z.enum(['in_progress', 'completed', 'abandoned', 'analysis_pending', 'analyzed']).optional(),
    currentQuestionId: z.string().max(200).optional(),
    respondentName: z.string().trim().max(150).optional(),
    respondentRole: z.string().trim().max(150).optional(),
    respondentEmail: z.string().trim().email().max(254).optional(),
    respondentPhone: z.string().trim().max(40).optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Missing interview ID' }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        interviewId: id,
        status: 'in_progress',
        companyId: null,
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const payload = patchInterviewSchema.parse(body);

        return NextResponse.json({
            success: true,
            interviewId: params.id,
            updated: payload,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Interview update payload is invalid.', details: error.flatten() },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update interview state', details: error.message },
            { status: 500 }
        );
    }
}
