'use client';

import React from 'react';
import { useInterview } from '@/lib/hooks/useInterview';
import { Header } from '@/components/interview/Header';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { ThinkingIndicator } from '@/components/interview/ThinkingIndicator';
import { ValidationScreen } from '@/components/interview/ValidationScreen';
import { DiscoveryReportView } from '@/components/report/DiscoveryReport';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function InterviewPage() {
  const {
    state,
    currentQuestion,
    isLoading,
    error,
    validationSummary,
    report,
    submitAnswer,
    generateReport,
    restartInterview,
  } = useInterview();

  // 1. Render Completed Business Discovery Report
  if (report) {
    return (
      <div className="min-h-screen bg-white text-black py-6">
        <div className="w-full max-w-5xl mx-auto px-4 flex justify-between items-center mb-4">
          <span className="text-xs font-mono text-subtle">Phase: Report Completed</span>
          <button
            onClick={restartInterview}
            className="text-xs font-mono text-black underline hover:opacity-75"
          >
            Start New Discovery Session
          </button>
        </div>
        <DiscoveryReportView report={report} />
      </div>
    );
  }

  // 2. Render Final Human Validation Screen (PRD Section 19)
  if (validationSummary) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        <Header
          questionCount={state.questionCount}
          estimatedMinutesLeft={state.estimatedRemainingMinutes}
          phase="validation"
        />
        <ValidationScreen
          summary={validationSummary}
          onConfirmValidation={generateReport}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // 3. Render One-Question Interview Card Flow (PRD Section 6.2 & 6.3)
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Header with progress & time budget */}
      <Header
        questionCount={state.questionCount}
        estimatedMinutesLeft={state.estimatedRemainingMinutes}
        phase={state.interviewPhase}
      />

      {/* Center Stage: Question Card & Transitions */}
      <main className="flex-1 flex flex-col justify-center items-center py-4">
        {error ? (
          /* Error State (PRD Section 36) */
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
            <QuestionCard
              question={currentQuestion}
              onSubmitAnswer={submitAnswer}
              isLoading={isLoading}
            />

            {isLoading && <ThinkingIndicator />}
          </>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full text-center py-4 text-[11px] font-mono text-subtle">
        Press Enter or click option to submit &bull; AI Business Discovery Engine
      </footer>
    </div>
  );
}
