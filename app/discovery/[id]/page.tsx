'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { Header } from '@/components/interview/Header';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { ThinkingIndicator } from '@/components/interview/ThinkingIndicator';
import { ValidationScreen } from '@/components/interview/ValidationScreen';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DiscoveryRuntimePage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.id as string;

  const {
    state,
    currentQuestion,
    isLoading,
    error,
    validationSummary,
    submitAnswer,
    generateReport,
  } = useInterview(interviewId);

  // If report is generated, route to /discovery/[id]/report
  if (state?.phase === 'complete') {
    router.push(`/discovery/${interviewId}/report`);
  }

  // Pre-report Validation screen (PRD Section 19)
  if (validationSummary) {
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
          summary={validationSummary}
          onConfirmValidation={async (choice, correction) => {
            await generateReport(choice, correction);
            router.push(`/discovery/${interviewId}/report`);
          }}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Header with server-authoritative timer */}
      <Header
        questionCount={state?.questionsAsked || 1}
        startedAt={state?.startedAt}
        targetSeconds={state?.targetDurationSeconds || 720}
        phase={state?.phase || 'orientation'}
        timeMode={state?.timeMode || 'normal'}
      />

      {/* Main Question Card & Runtime Transitions */}
      <main className="flex-1 flex flex-col justify-center items-center py-4">
        {error ? (
          <div className="glass-card p-8 rounded-2xl border border-red-200 text-center max-w-md mx-auto flex flex-col items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-black" />
            <h3 className="text-base font-bold text-black">
              I&apos;m having trouble generating the next question.
            </h3>
            <p className="text-xs text-subtle font-mono">
              Don&apos;t worry—your previous answer is saved. Please click below to retry.
            </p>
            <button
              onClick={() => submitAnswer()}
              className="px-6 py-3 rounded-xl bg-black text-white text-xs font-mono font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
          </div>
        ) : (
          <>
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                onSubmitAnswer={submitAnswer}
                isLoading={isLoading}
              />
            )}

            {isLoading && <ThinkingIndicator />}
          </>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full text-center py-4 text-[11px] font-mono text-subtle">
        AI Business Discovery Agent Runtime &bull; Server-Authoritative Budget &bull; Realtime AI Reasoning
      </footer>
    </div>
  );
}
