'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionObject } from '@/lib/ai/types';
import { AnswerInputs } from './AnswerInputs';

interface QuestionCardProps {
  question: QuestionObject;
  onSubmitAnswer: (answerText?: string, selectedOptions?: string[]) => void;
  isLoading?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSubmitAnswer,
  isLoading = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card p-6 sm:p-10 rounded-2xl border border-borderDark flex flex-col gap-6"
        >
          {/* Badge & Meta */}
          <div className="flex items-center justify-between text-xs font-mono text-subtle">
            <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-surface border border-borderDark text-black">
              {question.category.replace(/_/g, ' ')}
            </span>
            <span className="capitalize">
              {question.type.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Main Question Text (PRD Section 6.2 & 10) */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black leading-snug">
            {question.text}
          </h2>

          {/* Input Form Controls */}
          <AnswerInputs
            type={question.type}
            options={question.options}
            onSubmit={onSubmitAnswer}
            disabled={isLoading}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
