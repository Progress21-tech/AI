'use client';

import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useInterview } from '@/lib/hooks/useInterview';
import { Header } from '@/components/interview/Header';
import { QuestionCard } from '@/components/interview/QuestionCard';

export default function DiscoveryRuntimePage() {
  const router = useRouter();
  const interviewId = useParams<{ id: string }>().id;
  const { question, questionNumber, totalQuestions, completed, isLoading, error, submitAnswer, retry } = useInterview(interviewId);
  if (completed) router.replace(`/discovery/${interviewId}/complete`);
  return <main className="min-h-screen bg-[#fafafa] text-black"><Header questionNumber={questionNumber} totalQuestions={totalQuestions} /><div className="flex min-h-[65vh] items-center">{error ? <div className="mx-auto max-w-md px-5 text-center"><AlertTriangle className="mx-auto h-8 w-8" /><h1 className="mt-4 text-xl font-semibold">Your previous answers are safe.</h1><p className="mt-2 text-sm text-subtle">{error}</p><button onClick={retry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"><RefreshCw className="h-4 w-4" />Try again</button></div> : question ? <QuestionCard question={question} onSubmitAnswer={submitAnswer} isLoading={isLoading} /> : <p className="mx-auto text-sm text-subtle">Loading your interview…</p>}</div></main>;
}
