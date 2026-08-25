import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/auth/server';

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

    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const supabase = await createServerSupabaseClient();
    const record = supabase ? await supabase.from('interviews').select('company_id, status, current_question_id, started_at, last_activity_at, target_duration_seconds').eq('id', id).maybeSingle() : null;
    if (supabase && !record?.data) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    return NextResponse.json({
      success: true,
      interviewId: id,
        status: record?.data?.status ?? 'in_progress',
        companyId: record?.data?.company_id ?? null,
        currentQuestionId: record?.data?.current_question_id ?? null,
        startedAt: record?.data?.started_at ?? null,
        lastActivityAt: record?.data?.last_activity_at ?? null,
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await getAuthContext();
        if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
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
