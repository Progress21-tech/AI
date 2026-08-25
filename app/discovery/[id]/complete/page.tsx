'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { Header } from '@/components/interview/Header';
import { ValidationScreen } from '@/components/interview/ValidationScreen';

export default function CompleteValidationPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.id as string;

  const {
    state,
    isLoading,
    validationSummary,
    generateReport,
  } = useInterview(interviewId);

  const fallbackSummary = validationSummary || {
    businessOverview: 'Accounting & Financial Services business.',
    teamAndRoles: 'Task assignment method: WhatsApp / Email / Spreadsheets.',
    primaryTools: 'Core tech stack: QuickBooks, Excel, WhatsApp.',
    keyWorkflows: ['Client Document Collection', 'Tax Preparation & Filing'],
    topProblems: [
      {
        title: 'Client Document Collection Delay',
        summary: 'Chasing clients manually via WhatsApp/email leads to bottlenecks.',
        severity: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header
        questionCount={state?.questionsAsked || 8}
        startedAt={state?.startedAt}
        targetSeconds={state?.targetDurationSeconds}
        phase="validation"
        timeMode={state?.timeMode}
      />
      <ValidationScreen
        summary={fallbackSummary}
        onConfirmValidation={async (choice, correctionText) => {
          await generateReport(choice, correctionText);
          router.push(`/discovery/${interviewId}/report`);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
