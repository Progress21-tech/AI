'use client';

import React, { useState, useEffect } from 'react';
import { InterviewPhase, TimeMode } from '@/lib/ai/types';
import { Clock, Compass, Zap } from 'lucide-react';

interface HeaderProps {
  questionCount: number;
  maxEstimatedQuestions?: number;
  startedAt?: string;
  targetSeconds?: number; // e.g. 720 (12 mins)
  phase: InterviewPhase;
  timeMode?: TimeMode;
}

export const Header: React.FC<HeaderProps> = ({
  questionCount,
  maxEstimatedQuestions = 10,
  startedAt,
  targetSeconds = 720,
  phase,
  timeMode = 'normal',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(targetSeconds);

  // Server-authoritative timer countdown (PRD Section 16)
  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const startMs = new Date(startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, targetSeconds - elapsed);
      setSecondsRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, targetSeconds]);

  const formatMinutes = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.round((questionCount / maxEstimatedQuestions) * 100));

  const formatPhaseLabel = (p: InterviewPhase) => {
    switch (p) {
      case 'orientation': return 'Orientation';
      case 'business_mapping': return 'Business Mapping';
      case 'operations': return 'Technology & Operations';
      case 'problem_discovery': return 'Problem Discovery';
      case 'problem_deep_dive': return 'Problem Deep Dive';
      case 'validation': return 'Final Validation';
      case 'complete': return 'Report Completed';
      default: return 'Business Discovery';
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-xs tracking-tighter">
            AGY
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-black">Business Discovery Agent</h1>
          <p className="text-xs text-subtle font-mono">{questionCount} questions answered</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Phase Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-borderDark text-subtle">
            <Compass className="w-3.5 h-3.5" />
            <span>{formatPhaseLabel(phase)}</span>
          </div>

          {/* AI Time Mode Badge (PRD Section 17) */}
          {timeMode && timeMode !== 'normal' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-white fill-white" />
              <span>{timeMode.replace('_', ' ')}</span>
            </div>
          )}

          {/* Dynamic Budget Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-borderDark text-black">
            <Clock className="w-3.5 h-3.5 text-subtle" />
            <span>{formatMinutes(secondsRemaining)} left</span>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-borderDark">
        <div 
          className="bg-black h-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>
    </header>
  );
};
