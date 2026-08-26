'use client';

import { AnswerInputs } from './AnswerInputs';
import type { FixedQuestion } from '@/lib/interview/fixedQuestions';

export function QuestionCard({ question, onSubmitAnswer, isLoading }: { question: FixedQuestion; onSubmitAnswer: (answerText?: string, selectedOptions?: string[]) => void; isLoading: boolean }) {
  return <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-6"><section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.14em] text-subtle">Your response</p><h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{question.text}</h1><AnswerInputs type={question.type} options={question.options} onSubmit={onSubmitAnswer} disabled={isLoading} /></section></div>;
}
