import { NextRequest, NextResponse } from 'next/server';
import { generateDiscoveryReport, generateValidationSummary } from '@/lib/ai/reporting';
import { InterviewState } from '@/lib/ai/types';
import { buildAnalysisPayload } from '@/lib/interview/engine';
import { getAuthContext } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    const body = await req.json();
    const { action, state, validationChoice, correctionText } = body as {
      action: 'get_validation' | 'generate_report';
      state: InterviewState;
      validationChoice?: string;
      correctionText?: string;
    };

    if (!state) {
      return NextResponse.json({ error: 'Missing interview state' }, { status: 400 });
    }

    if (action === 'get_validation') {
      const summary = generateValidationSummary(state);
      return NextResponse.json({ success: true, summary });
    }

    if (action === 'generate_report') {
      const report = generateDiscoveryReport(state, validationChoice, correctionText);
      return NextResponse.json({ success: true, report, analysisPayload: buildAnalysisPayload(state) });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/interview/complete:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
