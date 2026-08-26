'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FixedQuestion } from '@/lib/interview/fixedQuestions';

type Runtime = { question: FixedQuestion | null; questionNumber: number; totalQuestions: number; completed: boolean };

export function useInterview(interviewId?: string) {
  const [runtime, setRuntime] = useState<Runtime>({ question: null, questionNumber: 1, totalQuestions: 12, completed: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInterview = useCallback(async () => {
    if (!interviewId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/interview/state?id=${encodeURIComponent(interviewId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRuntime(data);
    } catch {
      setError('We could not restore this interview. Please start a new one.');
    } finally { setIsLoading(false); }
  }, [interviewId]);

  useEffect(() => { loadInterview(); }, [loadInterview]);

  const startNewInterview = useCallback(async (companyInfo: { companyName: string; respondentName?: string; respondentRole?: string; respondentEmail?: string; respondentPhone?: string }) => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/interview/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(companyInfo) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.interviewId as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not start your interview.');
      return null;
    } finally { setIsLoading(false); }
  }, []);

  const submitAnswer = useCallback(async (answerText?: string, selectedOptions?: string[]) => {
    if (!interviewId || !runtime.question) return;
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/interview/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interviewId, questionKey: runtime.question.key, answerText, selectedOptions }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRuntime({ question: data.question, questionNumber: data.questionNumber, totalQuestions: data.totalQuestions, completed: data.completed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your answer. Please try again.");
    } finally { setIsLoading(false); }
  }, [interviewId, runtime.question]);

  return { ...runtime, isLoading, error, startNewInterview, submitAnswer, retry: loadInterview };
}
