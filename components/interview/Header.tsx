'use client';

import React from 'react';
import { InterviewPhase } from '@/lib/ai/types';
import { Clock, CheckCircle2, Compass } from 'lucide-react';

interface HeaderProps {
  questionCount: number;
  maxEstimatedQuestions?: number;
  estimatedMinutesLeft: number;
  phase: InterviewPhase;
}

export const Header: React.FC<HeaderProps> = ({
  questionCount,
  maxEstimatedQuestions = 10,
  estimatedMinutesLeft,
  phase,
}) => {
  const progressPercent = Math.min(100, Math.round((questionCount / maxEstimatedQuestions) * 100));

  const formatPhaseLabel = (p: InterviewPhase) => {
    switch (p) {
      case 'overview': return 'Business Overview';
      case 'team': return 'Team & Roles';
      case 'operations': return 'Technology & Operations';
      case 'problem_detection': return 'Problem Identification';
      case 'deep_dive': return 'Problem Investigation';
      case 'validation': return 'Final Validation';
      case 'completed': return 'Report Ready';
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
            <h1 className="text-sm font-semibold tracking-tight text-black">Business Discovery</h1>
            <p className="text-xs text-subtle font-mono">One-Question Adaptive Interview</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-borderDark text-subtle">
            <Compass className="w-3.5 h-3.5" />
            <span>{formatPhaseLabel(phase)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-borderDark text-black">
            <Clock className="w-3.5 h-3.5 text-subtle" />
            <span>~{estimatedMinutesLeft} min left</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (PRD Section 6.2 & 34) */}
      <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-borderDark">
        <div 
          className="bg-black h-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>
    </header>
  );
};
