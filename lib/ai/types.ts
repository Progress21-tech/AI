// TypeScript Types for AI Business Discovery Agent

export type QuestionType = 'single_choice' | 'multiple_choice' | 'short_text' | 'open_ended';

export type InterviewPhase = 
  | 'overview' 
  | 'team' 
  | 'operations' 
  | 'problem_detection' 
  | 'deep_dive' 
  | 'validation' 
  | 'completed';

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
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc';
  severity: number; // 1-10
  timeImpact: 'low' | 'medium' | 'high'; // or hours/week string
  financialImpact: string;
  customerImpact: string;
  currentWorkaround: string;
  rootCause: string;
  solutionGap: string;
  confidence: number; // 0.0 - 1.0
  status: 'suspected' | 'investigating' | 'confirmed';
  evidenceIds: string[];
  opportunityScore?: number;
}

export interface BusinessState {
  business: {
    industry?: string;
    services?: string[];
    employeeCount?: number;
    clientCount?: number;
    clientTypes?: string[];
    yearsInOperation?: string;
    locations?: string;
    businessModel?: string;
  };
  team: {
    roles?: string[];
    taskAssignmentMethod?: string;
    communicationTools?: string[];
    performanceTracking?: string;
  };
  technology: {
    accountingSoftware?: string[];
    crmSoftware?: string[];
    payrollSoftware?: string[];
    spreadsheetsUsed?: boolean;
    messagingApps?: string[];
    customTools?: string[];
    manualWorkarounds?: string[];
  };
  workflows: Record<string, 'not_started' | 'partially_understood' | 'fully_mapped'>;
  problems: ProblemRecord[];
  unknowns: string[];
  interviewPhase: InterviewPhase;
  questionCount: number;
  startTime: string;
  estimatedRemainingMinutes: number;
}

export interface AIReasoningResult {
  action: 'ask_question' | 'investigate_problem' | 'change_category' | 'validate_summary' | 'finish_interview';
  phase: InterviewPhase;
  objective: string;
  reasoningSummary: string; // Concise summary, no private CoT
  question: QuestionObject;
  extractedFacts: BusinessFact[];
  detectedProblems: ProblemRecord[];
  stateUpdates: { key: string; value: any }[];
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
