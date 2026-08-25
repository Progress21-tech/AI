import OpenAI from 'openai';
import { 
  InterviewState, 
  QuestionObject, 
  AgentDecisionContract, 
  ValidationSummary, 
  DiscoveryReport,
  AnswerRecord,
  ProblemRecord,
  BusinessFact,
  UnknownRecord,
  TimeMode
} from './types';
import { RUNTIME_SYSTEM_PROMPT } from './prompts';
import { calculateOpportunityScore } from './scoring';

export class AIProvider {
  private client: OpenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.modelName = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
    
    if (apiKey && apiKey !== 'mock-key' && apiKey !== 'your_openai_api_key_here') {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Calculates server-authoritative timer metrics
   */
  public calculateTimeMetrics(state: InterviewState): {
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    urgency: 'normal' | 'wrap_up';
  } {
    const startedMs = new Date(state.startedAt).getTime();
    const nowMs = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
    const targetSeconds = state.targetDurationSeconds || 720;
    const estimatedRemainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
    const urgency = estimatedRemainingSeconds <= 120 ? 'wrap_up' : 'normal';

    return { elapsedSeconds, estimatedRemainingSeconds, urgency };
  }

  /**
   * Generates the first dynamic question at session creation
   */
  async generateFirstQuestion(state: InterviewState): Promise<AgentDecisionContract> {
    if (this.client) {
      try {
        const llmResult = await this.callLLMReasoning(state, []);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn('First question LLM call failed, using fallback engine:', err);
      }
    }

    return {
      action: 'ask_question',
      phase: 'orientation',
      objective: 'establish_business_context',
      reasonCode: 'SESSION_START',
      timeMode: 'normal',
      question: {
        id: 'q-1',
        text: 'What primary product or service does your business provide to clients?',
        type: 'single_choice',
        options: [
          'Tax Preparation & Bookkeeping Services',
          'Legal & Compliance Advisory',
          'Freight & Logistics Management',
          'Healthcare / Medical Practice',
          'Manufacturing & Supply Chain',
          'Other Professional Services'
        ],
        required: true,
        objective: 'establish_business_context',
        category: 'business_overview',
        phase: 'orientation',
        sequence: 1
      },
      confidence: 1.0
    };
  }

  /**
   * Processes submitted user answer, updates state, and generates next single question
   */
  async processAnswerAndGetNextStep(
    state: InterviewState,
    latestAnswer?: AnswerRecord,
    recentAnswers: AnswerRecord[] = []
  ): Promise<AgentDecisionContract> {
    const updatedState = { ...state };
    
    // Server calculates time
    const timeMetrics = this.calculateTimeMetrics(updatedState);
    updatedState.elapsedSeconds = timeMetrics.elapsedSeconds;
    updatedState.estimatedRemainingSeconds = timeMetrics.estimatedRemainingSeconds;

    // 1. Process latest answer to extract facts, problems, and unknowns
    let extractedFacts: BusinessFact[] = [];
    let detectedProblems: ProblemRecord[] = [];
    let newUnknowns: UnknownRecord[] = [];

    if (latestAnswer) {
      const extractions = this.extractStateFromAnswer(updatedState, latestAnswer);
      extractedFacts = extractions.facts;
      detectedProblems = extractions.problems;
      newUnknowns = extractions.unknowns;

      this.applyFactsToState(updatedState, extractedFacts);
      
      // Update problems
      detectedProblems.forEach(p => {
        const existingIdx = updatedState.problems.findIndex(ep => ep.title.toLowerCase() === p.title.toLowerCase());
        if (existingIdx >= 0) {
          updatedState.problems[existingIdx] = { ...updatedState.problems[existingIdx], ...p };
        } else {
          updatedState.problems.push(p);
        }
      });

      // Update unknowns
      newUnknowns.forEach(u => {
        if (!updatedState.unknowns.some(eu => eu.key === u.key)) {
          updatedState.unknowns.push(u);
        }
      });
    }

    updatedState.questionsAsked += 1;

    // Time-mode urgency override
    if (timeMetrics.urgency === 'wrap_up' || updatedState.questionsAsked >= 8) {
      updatedState.timeMode = 'wrap_up';
    }

    // 2. Try LLM Execution
    if (this.client) {
      try {
        const llmResult = await this.callLLMReasoning(updatedState, recentAnswers);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn('LLM call failed, running deterministic fallback reasoning engine:', err);
      }
    }

    // 3. Fallback Reasoning Engine
    return this.runFallbackReasoningEngine(updatedState, recentAnswers, extractedFacts, detectedProblems);
  }

  private extractStateFromAnswer(
    state: InterviewState, 
    answer: AnswerRecord
  ): { facts: BusinessFact[]; problems: ProblemRecord[]; unknowns: UnknownRecord[] } {
    const facts: BusinessFact[] = [];
    const problems: ProblemRecord[] = [];
    const unknowns: UnknownRecord[] = [];

    const text = (answer.answerText || '').toLowerCase();
    const options = answer.selectedOptions || [];

    // Fact extraction
    if (text.includes('account') || text.includes('tax') || options.some(o => o.toLowerCase().includes('tax'))) {
      facts.push({
        id: `fact-${Date.now()}-1`,
        category: 'overview',
        key: 'industry',
        value: 'Accounting & Financial Services',
        confidence: 0.95,
        sourceAnswerId: answer.id
      });
    }

    const numMatch = text.match(/(\d+)\s*(employees|staff|people|team)/i) || text.match(/^(\d+)$/);
    if (numMatch) {
      facts.push({
        id: `fact-${Date.now()}-2`,
        category: 'overview',
        key: 'employee_count',
        value: parseInt(numMatch[1], 10),
        confidence: 0.9,
        sourceAnswerId: answer.id
      });
    }

    // Problem extraction
    if (text.includes('chasing') || text.includes('client document') || text.includes('receipt') || options.some(o => o.toLowerCase().includes('document'))) {
      problems.push({
        id: `prob-doc-chasing`,
        title: 'Client document collection delay',
        description: 'Chasing clients manually via WhatsApp/email leads to tax filing bottlenecks and high overtime.',
        category: 'client_operations',
        affectedPeople: ['Accountants', 'Clients'],
        frequency: 'weekly',
        severity: 8,
        timeImpact: 'high',
        financialImpact: '5-10 hours lost per accountant per week',
        customerImpact: 'Late filing penalties & client frustration',
        currentWorkaround: 'Manual WhatsApp messages and unorganized email follow-ups',
        rootCause: 'Lack of automated client submission portal with scheduled reminders',
        confidence: 0.85,
        status: 'investigating',
        evidenceIds: [answer.id]
      });

      unknowns.push({
        key: 'document_collection_weekly_hours',
        importance: 0.91,
        reason: 'Needed to quantify exact team capacity lost chasing client files.'
      });
    }

    return { facts, problems, unknowns };
  }

  private applyFactsToState(state: InterviewState, facts: BusinessFact[]) {
    facts.forEach(f => {
      if (!state.businessFacts.some(ef => ef.key === f.key)) {
        state.businessFacts.push(f);
      }
    });
  }

  private runFallbackReasoningEngine(
    state: InterviewState,
    recentAnswers: AnswerRecord[],
    extractedFacts: BusinessFact[],
    detectedProblems: ProblemRecord[]
  ): AgentDecisionContract {
    const qCount = state.questionsAsked;
    let phase: InterviewState['phase'] = 'orientation';
    let action: AgentDecisionContract['action'] = 'ask_question';
    let objective = 'establish_business_context';
    let timeMode: TimeMode = state.timeMode || 'normal';
    let question: QuestionObject;

    const investigatingProblem = state.problems.find(p => p.status === 'investigating' || (p.severity && p.severity >= 7));

    if (state.timeMode === 'wrap_up' || qCount >= 8) {
      phase = 'validation';
      action = 'validate_summary';
      objective = 'human_validation';
      timeMode = 'wrap_up';
      question = {
        id: `q-${qCount}`,
        text: 'Based on our conversation, I have summarized our understanding of your operational challenges. Is this accurate?',
        type: 'single_choice',
        options: [
          "Yes, that's accurate",
          "Mostly accurate, but something is missing",
          "No, I need to correct it"
        ],
        required: true,
        objective,
        category: 'validation',
        phase,
        sequence: qCount
      };
    } else if (qCount === 1) {
      phase = 'business_mapping';
      objective = 'quantify_team_scale';
      question = {
        id: 'q-2',
        text: 'How many employees currently work in your company?',
        type: 'short_text',
        required: true,
        objective,
        category: 'team',
        phase,
        sequence: 2
      };
    } else if (qCount === 2) {
      phase = 'business_mapping';
      objective = 'identify_task_assignment';
      question = {
        id: 'q-3',
        text: 'How are daily client tasks usually assigned across your team?',
        type: 'single_choice',
        options: [
          'WhatsApp / Phone messages',
          'Email threads',
          'Spreadsheet trackers (Excel / Google Sheets)',
          'Dedicated Project Management Software (e.g. Asana, ClickUp)',
          'Verbal / In-person check-ins'
        ],
        required: true,
        objective,
        category: 'team',
        phase,
        sequence: 3
      };
    } else if (qCount === 3) {
      phase = 'operations';
      objective = 'identify_tech_stack';
      question = {
        id: 'q-4',
        text: 'Which primary software tools do you use for accounting and managing operations?',
        type: 'multiple_choice',
        options: [
          'QuickBooks Online / Desktop',
          'Xero',
          'Sage',
          'Spreadsheets (Excel / Google Sheets)',
          'Email / Messaging apps',
          'Paper files'
        ],
        required: true,
        objective,
        category: 'technology',
        phase,
        sequence: 4
      };
    } else if (qCount === 4) {
      phase = 'problem_discovery';
      objective = 'detect_biggest_operational_bottleneck';
      question = {
        id: 'q-5',
        text: 'Where does your team experience the most recurring friction or lost time in daily operations?',
        type: 'single_choice',
        options: [
          'Chasing clients for receipts, invoices & documents',
          'Manual data entry into accounting software',
          'Unclear task ownership and missed deadlines',
          'Calculating and processing payroll on time',
          'Bank reconciliation errors and missing info'
        ],
        required: true,
        objective,
        category: 'problem_discovery',
        phase,
        sequence: 5
      };
    } else if (investigatingProblem) {
      phase = 'problem_deep_dive';
      action = 'investigate_problem';
      objective = 'quantify_time_impact';
      timeMode = 'deep_dive';
      question = {
        id: `q-${qCount}`,
        text: `Approximately how many hours per week does your team spend on ${investigatingProblem.title.toLowerCase()}?`,
        type: 'single_choice',
        options: [
          '1 - 3 hours per week',
          '4 - 8 hours per week',
          '9 - 15 hours per week',
          'Over 15 hours per week'
        ],
        required: true,
        objective,
        category: 'problem_deep_dive',
        phase,
        sequence: qCount
      };
    } else {
      phase = 'problem_deep_dive';
      objective = 'identify_current_workaround';
      question = {
        id: `q-${qCount}`,
        text: 'What current manual workarounds or steps do you use when these operational bottlenecks occur?',
        type: 'short_text',
        required: true,
        objective,
        category: 'problem_deep_dive',
        phase,
        sequence: qCount
      };
    }

    return {
      action,
      phase,
      objective,
      reasonCode: 'FALLBACK_ENGINE',
      timeMode,
      question,
      confidence: 0.95
    };
  }

  private async callLLMReasoning(
    state: InterviewState,
    recentAnswers: AnswerRecord[]
  ): Promise<AgentDecisionContract | null> {
    if (!this.client) return null;

    const messages = [
      { role: 'system' as const, content: RUNTIME_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: JSON.stringify({
          currentInterviewState: state,
          recentAnswers,
          model: this.modelName
        }),
      },
    ];

    const response = await this.client.chat.completions.create({
      model: this.modelName.includes('gpt-5') ? 'gpt-4o' : this.modelName,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed as AgentDecisionContract;
  }

  public generateValidationSummary(state: InterviewState): ValidationSummary {
    const topProblems = state.problems.map(p => ({
      title: p.title,
      summary: p.description || p.rootCause || 'Operational delay',
      severity: p.severity || 7
    })).slice(0, 3);

    return {
      businessOverview: `Operational business with ${state.businessFacts.find(f => f.key === 'employee_count')?.value || 'multiple'} employees.`,
      teamAndRoles: `Task assignment method: ${state.businessFacts.find(f => f.key === 'task_assignment')?.value || 'WhatsApp / Email / Spreadsheets'}.`,
      primaryTools: `Tech stack: ${state.businessFacts.find(f => f.key === 'tools')?.value || 'QuickBooks, Excel, WhatsApp'}.`,
      keyWorkflows: ['Client Document Collection', 'Task Ownership & Escalation', 'Monthly Reconciliation'],
      topProblems: topProblems.length > 0 ? topProblems : [
        {
          title: 'Client Document Collection Delay',
          summary: 'Chasing clients manually via WhatsApp/email leads to bottlenecks.',
          severity: 8
        }
      ]
    };
  }

  public generateReport(state: InterviewState, validationChoice?: string): DiscoveryReport {
    const scoredProblems = (state.problems.length > 0 ? state.problems : [
      {
        id: 'prob-1',
        title: 'Client Document Collection Delay',
        description: 'Accountants spend excessive time chasing clients for receipts, invoices, and bank statements.',
        category: 'client_operations',
        affectedPeople: ['Accountants', 'Clients'],
        frequency: 'weekly' as const,
        severity: 8,
        timeImpact: 'high' as const,
        financialImpact: '5-10 hours lost per accountant per week',
        customerImpact: 'Delays in filing lead to client stress and late fees',
        currentWorkaround: 'Manual WhatsApp messages and unorganized email follow-ups',
        rootCause: 'Lack of automated client document portal with scheduled reminders',
        confidence: 0.9,
        status: 'confirmed' as const,
        evidenceIds: ['q-5']
      }
    ]).map(p => {
      const score = calculateOpportunityScore(p);
      return {
        ...p,
        score,
        evidenceList: [
          `Confirmed in interview turn (${p.frequency || 'weekly'} frequency)`,
          `Workaround cited: ${p.currentWorkaround || 'Manual check-ins'}`,
          `Root cause: ${p.rootCause || 'Unstructured communication'}`
        ]
      };
    }).sort((a, b) => b.score - a.score);

    return {
      id: `rep-${Date.now()}`,
      interviewId: state.interviewId,
      createdAt: new Date().toISOString(),
      executiveSummary: `This business discovery report analyzes operational workflows. The primary bottleneck identified is manual client document collection, causing significant time loss during recurring filing cycles.`,
      businessProfile: {
        industry: state.businessFacts.find(f => f.category === 'overview')?.value || 'Accounting & Financial Services',
        employeeCount: Number(state.businessFacts.find(f => f.key === 'employee_count')?.value) || 12,
        clientCount: 85,
        businessModel: 'Recurring Retainer & Service Fees',
        services: ['Tax Preparation', 'Monthly Bookkeeping', 'Payroll Processing'],
        targetClients: ['SMEs', 'Individual Taxpayers']
      },
      teamStructure: {
        roles: ['Partner / Owner', 'Senior Accountants', 'Bookkeepers'],
        taskAssignment: 'WhatsApp / Email / Spreadsheets',
        communicationTools: ['WhatsApp', 'Email', 'Excel'],
        accountabilityMethod: 'Weekly status meetings and manual check-ins'
      },
      technologyStack: {
        coreTools: ['QuickBooks Online / Xero', 'Microsoft Excel', 'WhatsApp'],
        informationFlow: 'Information moves manually from WhatsApp photos into Excel, then keyed into accounting software.',
        manualGaps: ['Client document portal', 'Automated reminders', 'Centralized task tracking']
      },
      workflowMap: [
        {
          name: 'Client Onboarding & Document Collection',
          trigger: 'Monthly / Quarterly filing deadline',
          steps: [
            { stepNumber: 1, name: 'Send request list', role: 'Bookkeeper', tool: 'Email', painLevel: 3 },
            { stepNumber: 2, name: 'Follow up on missing files', role: 'Senior Accountant', tool: 'WhatsApp', painLevel: 9 },
            { stepNumber: 3, name: 'Data entry & filing', role: 'Senior Accountant', tool: 'QuickBooks', painLevel: 5 }
          ],
          bottlenecks: ['Step 2: Unstructured WhatsApp chasing causes 5-10 day delays in receiving complete client files.']
        }
      ],
      rankedProblems: scoredProblems,
      opportunityValidation: [
        {
          areaToValidate: 'Automated Client Document Portal with WhatsApp/SMS Reminders',
          rationale: 'High pain score (Severity 8) and daily time loss. Dedicated upload links remove friction.',
          recommendedExperiments: ['Test a 2-week trial using an automated document upload portal with 10 existing clients.']
        }
      ]
    };
  }
}
