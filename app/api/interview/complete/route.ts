import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai/provider';
import { InterviewState } from '@/lib/ai/types';

const aiProvider = new AIProvider();

export async function POST(req: NextRequest) {
  try {
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
      const summary = aiProvider.generateValidationSummary(state);
      return NextResponse.json({ success: true, summary });
    }

    if (action === 'generate_report') {
      const report = aiProvider.generateReport(state, validationChoice);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/interview/complete:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
