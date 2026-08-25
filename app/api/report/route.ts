import { NextRequest, NextResponse } from 'next/server';
import { generateDiscoveryReport, generateValidationSummary } from '@/lib/ai/reporting';
import { InterviewState } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, state, validationChoice } = body as {
      action: 'get_validation_summary' | 'generate_report';
      state: InterviewState;
      validationChoice?: string;
    };

    if (!state) {
      return NextResponse.json({ error: 'Missing business state' }, { status: 400 });
    }

    if (action === 'get_validation_summary') {
      const summary = generateValidationSummary(state);
      return NextResponse.json({ success: true, summary });
    }

    if (action === 'generate_report') {
      const report = generateDiscoveryReport(state, validationChoice);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
