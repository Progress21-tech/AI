// TypeScript Definitions for AI Business Discovery Agent - Runtime Phase

export type QuestionType = 'single_choice' | 'multiple_choice' | 'short_text' | 'open_ended';

export type InterviewPhase = 
  | 'orientation' 
  | 'business_mapping' 
  | 'operations' 
  | 'problem_discovery' 
  | 'problem_deep_dive' 
  | 'validation' 
  | 'complete';

export type TimeMode = 'normal' | 'focus' | 'deep_dive' | 'wrap_up';

export interface QuestionObject {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  objective: string;
  category: string;
  phase: InterviewPhase;
  sequence: number;
}

export interface AnswerRecord {
  id: string;
  questionId: string;
  questionText: string;
  answerText?: string;
  selectedOptions?: string[];
  timestamp: string;
}

export interface BusinessFact {
  id: string;
  category: string;
  key: string;
  value: any;
  confidence: number;
  sourceAnswerId?: string;
}

export interface ProblemRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  affectedPeople: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc' | null;
  severity: number | null; // 1-10
  timeImpact: 'low' | 'medium' | 'high' | null;
  financialImpact: string | null;
  customerImpact: string | null;
  currentWorkaround: string | null;
  rootCause: string | null;
  solutionGap?: string | null;
  confidence: number; // 0.0 - 1.0
  status: 'suspected' | 'investigating' | 'confirmed';
  evidenceIds: string[];
  score?: number;
}

export interface UnknownRecord {
  key: string;
  importance: number; // 0.0 - 1.0
  reason: string;
}

export interface InterviewState {
  interviewId: string;
  phase: InterviewPhase;
  businessFacts: BusinessFact[];
  workflows: any[];
  problems: ProblemRecord[];
  unknowns: UnknownRecord[];
  currentObjective: string | null;
  questionsAsked: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string | null;
  targetDurationSeconds: number; // default 720s (12 minutes)
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  timeMode: TimeMode;
}

export interface AgentDecisionContract {
  action: 'ask_question' | 'investigate_problem' | 'change_category' | 'validate_summary' | 'finish_interview';
  phase: InterviewPhase;
  objective: string;
  reasonCode: string;
  timeMode: TimeMode;
  question: QuestionObject;
  stateUpdates?: { key: string; value: any }[];
  confidence: number;
}

export interface ValidationSummary {
  businessOverview: string;
  teamAndRoles: string;
  primaryTools: string;
  keyWorkflows: string[];
  topProblems: {
    title: string;
    summary: string;
    severity: number;
  }[];
}

export interface DiscoveryReport {
  id: string;
  interviewId: string;
  createdAt: string;
  executiveSummary: string;
  businessProfile: {
    industry: string;
    employeeCount: number;
    clientCount: number;
    businessModel: string;
    services: string[];
    targetClients: string[];
  };
  teamStructure: {
    roles: string[];
    taskAssignment: string;
    communicationTools: string[];
    accountabilityMethod: string;
  };
  technologyStack: {
    coreTools: string[];
    informationFlow: string;
    manualGaps: string[];
  };
  workflowMap: {
    name: string;
    trigger: string;
    steps: {
      stepNumber: number;
      name: string;
      role: string;
      tool: string;
      painLevel: number;
    }[];
    bottlenecks: string[];
  }[];
  rankedProblems: (ProblemRecord & {
    score: number;
    evidenceList: string[];
  })[];
  opportunityValidation: {
    areaToValidate: string;
    rationale: string;
    recommendedExperiments: string[];
  }[];
  qualityScore?: number;
}
