'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { DiscoveryReportView } from '@/components/report/DiscoveryReport';
import { AIProvider } from '@/lib/ai/provider';

const fallbackAiProvider = new AIProvider();

export default function DiscoveryReportPage() {
  const params = useParams();
  const interviewId = params?.id as string;
  const { report, state } = useInterview(interviewId);

  const displayReport = report || (state ? fallbackAiProvider.generateReport(state) : fallbackAiProvider.generateReport({
    interviewId: interviewId || 'int-demo',
    phase: 'complete',
    businessFacts: [],
    workflows: [],
    problems: [],
    unknowns: [],
    currentObjective: null,
    questionsAsked: 8,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    targetDurationSeconds: 720,
    elapsedSeconds: 480,
    estimatedRemainingSeconds: 0,
    timeMode: 'wrap_up',
  }));

  return (
    <div className="min-h-screen bg-white text-black py-6">
      <div className="w-full max-w-5xl mx-auto px-4 flex justify-between items-center mb-4">
        <span className="text-xs font-mono text-subtle">Report ID: {interviewId}</span>
        <Link
          href="/discovery"
          className="text-xs font-mono text-black underline hover:opacity-75"
        >
          Start New Discovery Session
        </Link>
      </div>

      <DiscoveryReportView report={displayReport} />
    </div>
  );
}
