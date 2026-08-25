'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  InterviewState, 
  QuestionObject, 
  AnswerRecord, 
  AgentDecisionContract, 
  ValidationSummary, 
  DiscoveryReport 
} from '@/lib/ai/types';

const LOCAL_STORAGE_KEY = 'agy_agent_runtime_state';

export function useInterview(interviewIdFromParam?: string) {
  const [state, setState] = useState<InterviewState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionObject | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<AnswerRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [report, setReport] = useState<DiscoveryReport | null>(null);

  /**
   * Initializes a new discovery interview session
   */
  const startNewInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to initialize discovery interview session.');

      const data = await res.json();
      const newState: InterviewState = data.state;
      const decision: AgentDecisionContract = data.decision;

      setState(newState);
      setCurrentQuestion(decision.question);
      setRecentAnswers([]);
      setValidationSummary(null);
      setReport(null);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        state: newState,
        currentQuestion: decision.question,
        recentAnswers: []
      }));

      return newState.interviewId;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Session start failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync state on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state) setState(parsed.state);
        if (parsed.currentQuestion) setCurrentQuestion(parsed.currentQuestion);
        if (parsed.recentAnswers) setRecentAnswers(parsed.recentAnswers);
        if (parsed.validationSummary) setValidationSummary(parsed.validationSummary);
        if (parsed.report) setReport(parsed.report);
      }
    } catch (e) {
      console.warn('Could not restore local state:', e);
    }
  }, []);

  // Save state updates to localStorage
  useEffect(() => {
    if (state && currentQuestion) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            state,
            currentQuestion,
            recentAnswers,
            validationSummary,
            report,
          })
        );
      } catch (e) {
        console.warn('Failed to save state:', e);
      }
    }
  }, [state, currentQuestion, recentAnswers, validationSummary, report]);

  /**
   * Submits user answer, persists before requesting next step
   */
  const submitAnswer = async (answerText?: string, selectedOptions?: string[]) => {
    if (!state || !currentQuestion) return;

    setIsLoading(true);
    setError(null);

    const answerRecord: AnswerRecord = {
      id: `ans-${Date.now()}`,
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answerText,
      selectedOptions,
      timestamp: new Date().toISOString(),
    };

    const updatedAnswers = [...recentAnswers, answerRecord];
    setRecentAnswers(updatedAnswers);

    try {
      const res = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          answer: answerRecord,
          recentAnswers: updatedAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error("I'm having trouble generating the next question. Please try again.");
      }

      const data = await res.json();
      const decision: AgentDecisionContract = data.decision;

      const newState: InterviewState = {
        ...state,
        phase: decision.phase,
        timeMode: decision.timeMode,
        questionsAsked: state.questionsAsked + 1,
        elapsedSeconds: data.updatedTimeMetrics?.elapsedSeconds || state.elapsedSeconds,
        estimatedRemainingSeconds: data.updatedTimeMetrics?.estimatedRemainingSeconds || state.estimatedRemainingSeconds,
      };

      setState(newState);

      if (decision.action === 'validate_summary' || newState.questionsAsked >= 8) {
        fetchValidationSummary(newState);
      } else {
        setCurrentQuestion(decision.question);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "I'm having trouble generating the next question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidationSummary = async (targetState: InterviewState) => {
    try {
      const res = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_validation',
          state: targetState,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setValidationSummary(data.summary);
      }
    } catch (e) {
      console.error('Validation fetch error:', e);
    }
  };

  const generateReport = async (validationChoice: string, correctionText?: string) => {
    if (!state) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_report',
          state,
          validationChoice,
          correctionText,
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setState((prev) => prev ? ({ ...prev, phase: 'complete' }) : null);
      }
    } catch (err: any) {
      setError('Report generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state,
    currentQuestion,
    recentAnswers,
    isLoading,
    error,
    validationSummary,
    report,
    startNewInterview,
    submitAnswer,
    generateReport,
  };
}
