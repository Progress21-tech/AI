// TypeScript Definitions for AI Business Discovery Agent - Runtime Phase

export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'yes_no'
  | 'scale'
  // Kept while older report/runtime code is phased out.
  | 'multiple_choice'
  | 'open_ended';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than';

export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface QuestionOption {
  value: string;
  label: string;
  score?: number;
  tags?: string[];
}

export interface Question {
  id: string;
  category: string;
  subcategory?: string;
  text: string;
  type: Exclude<QuestionType, 'multiple_choice' | 'open_ended'>;
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  helpText?: string;
  order: number;
  conditions?: Condition[];
  tags?: string[];
  purpose?: string;
  priority?: number;
  deepDive?: boolean;
  terminal?: boolean;
}

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
  placeholder?: string;
  helpText?: string;
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
  companyId?: string;
  answers?: AnswerRecord[];
  askedQuestionIds?: string[];
  diagnosticSignals?: string[];
  selectedProcesses?: string[];
  currentQuestionDbId?: string;
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
  source?: 'ai' | 'fallback';
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
  recommendations?: AIRecommendation[];
  implementationRoadmap?: {
    immediateActions: string[];
    shortTermActions: string[];
    mediumTermActions: string[];
    longTermOpportunities: string[];
  };
  qualityScore?: number;
}

export interface AIRecommendation {
  title: string;
  type: string;
  problemSolved: string;
  evidence: string[];
  whyItMatters: string;
  expectedImpact: string;
  priority: string;
  implementationDifficulty: string;
  suggestedApproach: string;
  nextStep: string;
}
