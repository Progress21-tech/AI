'use client';

import { useState, useEffect } from 'react';
import { 
  BusinessState, 
  QuestionObject, 
  AnswerRecord, 
  AIReasoningResult, 
  ValidationSummary, 
  DiscoveryReport 
} from '@/lib/ai/types';

const LOCAL_STORAGE_KEY = 'agy_business_discovery_state';

const initialBusinessState: BusinessState = {
  business: {},
  team: {},
  technology: {},
  workflows: {},
  problems: [],
  unknowns: [],
  interviewPhase: 'overview',
  questionCount: 0,
  startTime: new Date().toISOString(),
  estimatedRemainingMinutes: 12,
};

const initialQuestion: QuestionObject = {
  id: 'q-0',
  text: 'What primary industry or type of business do you operate?',
  type: 'single_choice',
  options: [
    'Accounting & Tax Services',
    'Legal / Advisory Firm',
    'Logistics & Freight',
    'Healthcare / Clinic',
    'Manufacturing / Distribution',
    'Other Professional Services'
  ],
  required: true,
  objective: 'establish_business_context',
  category: 'business_overview',
  phase: 'overview',
  sequence: 0,
};

export function useInterview() {
  const [state, setState] = useState<BusinessState>(initialBusinessState);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionObject>(initialQuestion);
  const [recentAnswers, setRecentAnswers] = useState<AnswerRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [report, setReport] = useState<DiscoveryReport | null>(null);

  // Load persisted state on mount (PRD Section 37)
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
      console.warn('Could not read saved interview state:', e);
    }
  }, []);

  // Persist state to localStorage on update
  useEffect(() => {
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
      console.warn('Could not save interview state:', e);
    }
  }, [state, currentQuestion, recentAnswers, validationSummary, report]);

  /**
   * Submit an answer for the active question
   */
  const submitAnswer = async (answerText?: string, selectedOptions?: string[]) => {
    setIsLoading(true);
    setError(null);

    const answerRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answerText,
      selectedOptions,
      timestamp: new Date().toISOString(),
    };

    const updatedAnswers = [...recentAnswers, answerRecord];
    setRecentAnswers(updatedAnswers);

    try {
      const res = await fetch('/api/interview', {
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
      const reasoning: AIReasoningResult = data.result;

      // Update phase & count
      const newState: BusinessState = {
        ...state,
        interviewPhase: reasoning.phase,
        questionCount: state.questionCount + 1,
        estimatedRemainingMinutes: Math.max(1, 14 - state.questionCount),
      };

      // Merge facts & problems
      if (reasoning.extractedFacts) {
        reasoning.extractedFacts.forEach((f) => {
          if (f.key === 'industry') newState.business.industry = f.value;
          if (f.key === 'employeeCount') newState.business.employeeCount = f.value;
        });
      }

      if (reasoning.detectedProblems) {
        reasoning.detectedProblems.forEach((p) => {
          const idx = newState.problems.findIndex((ep) => ep.title.toLowerCase() === p.title.toLowerCase());
          if (idx >= 0) newState.problems[idx] = { ...newState.problems[idx], ...p };
          else newState.problems.push(p);
        });
      }

      setState(newState);

      // Check for validation transition
      if (reasoning.action === 'validate_summary' || newState.questionCount >= 8) {
        fetchValidationSummary(newState);
      } else {
        setCurrentQuestion(reasoning.question);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "I'm having trouble generating the next question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch validation summary before report generation
   */
  const fetchValidationSummary = async (targetState: BusinessState) => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_validation_summary',
          state: targetState,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setValidationSummary(data.summary);
      }
    } catch (e) {
      console.error('Validation summary fetch failed:', e);
    }
  };

  /**
   * Generate final report upon human validation
   */
  const generateReport = async (validationChoice: string, correctionText?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/report', {
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
        setState((prev) => ({ ...prev, interviewPhase: 'completed' }));
      }
    } catch (err: any) {
      setError('Report generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const restartInterview = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState(initialBusinessState);
    setCurrentQuestion(initialQuestion);
    setRecentAnswers([]);
    setValidationSummary(null);
    setReport(null);
    setError(null);
  };

  return {
    state,
    currentQuestion,
    recentAnswers,
    isLoading,
    error,
    validationSummary,
    report,
    submitAnswer,
    generateReport,
    restartInterview,
  };
}
