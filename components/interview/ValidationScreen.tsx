'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ValidationSummary } from '@/lib/ai/types';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface ValidationScreenProps {
  summary: ValidationSummary;
  onConfirmValidation: (choice: string, correctionText?: string) => void;
  isLoading?: boolean;
}

export const ValidationScreen: React.FC<ValidationScreenProps> = ({
  summary,
  onConfirmValidation,
  isLoading = false,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [correctionText, setCorrectionText] = useState<string>('');

  const choices = [
    { key: 'accurate', label: "Yes, that's accurate" },
    { key: 'missing', label: 'Mostly accurate, but something is missing' },
    { key: 'correct', label: 'No, I need to correct it' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChoice) return;
    onConfirmValidation(selectedChoice, correctionText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto px-4 py-8"
    >
      <div className="glass-card p-6 sm:p-10 rounded-2xl border border-borderDark flex flex-col gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-subtle uppercase tracking-wider">
          <CheckCircle className="w-4 h-4 text-black" />
          <span>Final Pre-Report Validation</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
          Here is what I believe I understand about your business and its biggest operational challenges:
        </h2>

        {/* Structured Understanding Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          <div className="p-4 rounded-xl bg-surface border border-borderDark flex flex-col gap-1">
            <span className="text-xs font-mono font-semibold text-subtle">BUSINESS PROFILE</span>
            <p className="text-sm font-medium text-black">{summary.businessOverview}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-borderDark flex flex-col gap-1">
            <span className="text-xs font-mono font-semibold text-subtle">TEAM & ROLES</span>
            <p className="text-sm font-medium text-black">{summary.teamAndRoles}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-borderDark sm:col-span-2 flex flex-col gap-1">
            <span className="text-xs font-mono font-semibold text-subtle">TECHNOLOGY STACK</span>
            <p className="text-sm font-medium text-black">{summary.primaryTools}</p>
          </div>
        </div>

        {/* Detected Problems Summary */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono font-semibold text-subtle uppercase">Top Identified Bottlenecks</span>
          {summary.topProblems.map((prob, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black text-white flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold">{prob.title}</h4>
                <p className="text-xs text-gray-300 mt-1">{prob.summary}</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-mono font-semibold text-white whitespace-nowrap">
                Severity {prob.severity}/10
              </span>
            </div>
          ))}
        </div>

        {/* Validation Check Question (PRD Section 19) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 pt-4 border-t border-borderDark">
          <label className="text-base font-bold text-black">Is this accurate?</label>

          <div className="flex flex-col gap-2.5">
            {choices.map((c) => {
              const isSelected = selectedChoice === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedChoice(c.key)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-white text-black border-borderDark hover:bg-surface'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {(selectedChoice === 'missing' || selectedChoice === 'correct') && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-mono text-subtle">
                Please brief us on what should be corrected or added:
              </label>
              <textarea
                rows={3}
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="E.g. We also process payroll twice monthly using Sage..."
                className="w-full p-4 rounded-xl border border-borderDark bg-surface text-black text-sm placeholder:text-subtle focus:outline-none focus:border-black focus:bg-white resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !selectedChoice}
            className="w-full py-4 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Generating Discovery Report...' : 'Confirm & Generate Report'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
