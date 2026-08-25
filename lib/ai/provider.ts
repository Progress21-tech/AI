import OpenAI from 'openai';
import { 
  BusinessState, 
  QuestionObject, 
  AIReasoningResult, 
  ValidationSummary, 
  DiscoveryReport,
  AnswerRecord,
  ProblemRecord,
  BusinessFact
} from './types';
import { SYSTEM_INTERVIEWER_PROMPT } from './prompts';
import { calculateOpportunityScore } from './scoring';

export class AIProvider {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'mock-key' && apiKey !== 'your_openai_api_key_here') {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Generates the next objective and single adaptive question
   */
  async processAnswerAndGetNextStep(
    state: BusinessState,
    latestAnswer?: AnswerRecord,
    recentAnswers: AnswerRecord[] = []
  ): Promise<AIReasoningResult> {
    const updatedState = { ...state };
    
    // 1. Process latest answer to extract facts and update state
    let extractedFacts: BusinessFact[] = [];
    let detectedProblems: ProblemRecord[] = [];

    if (latestAnswer) {
      const extractions = this.extractFactsFromAnswer(updatedState, latestAnswer);
      extractedFacts = extractions.facts;
      detectedProblems = extractions.problems;
      
      // Merge facts into state
      this.applyFactsToState(updatedState, extractedFacts);
      
      // Update or insert problems
      detectedProblems.forEach(p => {
        const existingIdx = updatedState.problems.findIndex(ep => ep.title.toLowerCase() === p.title.toLowerCase());
        if (existingIdx >= 0) {
          updatedState.problems[existingIdx] = { ...updatedState.problems[existingIdx], ...p };
        } else {
          updatedState.problems.push(p);
        }
      });
    }

    updatedState.questionCount += 1;

    // 2. Try LLM execution if client is configured
    if (this.client) {
      try {
        const llmResult = await this.callLLMReasoning(updatedState, recentAnswers);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn('LLM call failed or invalid schema, falling back to deterministic reasoning engine:', err);
      }
    }

    // 3. Fallback Deterministic Adaptive Reasoning Engine
    return this.runFallbackReasoningEngine(updatedState, recentAnswers, extractedFacts, detectedProblems);
  }

  /**
   * Helper to extract facts locally based on response content
   */
  private extractFactsFromAnswer(state: BusinessState, answer: AnswerRecord): { facts: BusinessFact[]; problems: ProblemRecord[] } {
    const facts: BusinessFact[] = [];
    const problems: ProblemRecord[] = [];
    const text = (answer.answerText || '').toLowerCase();
    const options = answer.selectedOptions || [];

    // Industry / Context
    if (text.includes('account') || text.includes('tax') || text.includes('bookkeeping') || text.includes('audit')) {
      facts.push({
        id: `fact-${Date.now()}-1`,
        category: 'overview',
        key: 'industry',
        value: 'Accounting & Financial Services',
        confidence: 0.95,
        sourceAnswerId: answer.questionId,
      });
    }

    // Employee count extraction
    const numMatch = text.match(/(\d+)\s*(employees|staff|people|team)/i) || text.match(/^(\d+)$/);
    if (numMatch) {
      const count = parseInt(numMatch[1], 10);
      facts.push({
        id: `fact-${Date.now()}-2`,
        category: 'overview',
        key: 'employeeCount',
        value: count,
        confidence: 0.9,
      });
    }

    // Problem Detection Patterns (Section 13 & 14)
    if (text.includes('chasing') || text.includes('client document') || options.some(o => o.toLowerCase().includes('document'))) {
      problems.push({
        id: `prob-${Date.now()}-doc`,
        title: 'Client document collection delay',
        description: 'Chasing clients for receipts, invoices, and bank statements leads to tax filing bottlenecks.',
        category: 'client_operations',
        affectedPeople: ['accountants', 'clients'],
        frequency: 'weekly',
        severity: 8,
        timeImpact: 'high',
        financialImpact: 'Estimated 5-10 hours/week lost per accountant',
        customerImpact: 'Late filing penalties & client frustration',
        currentWorkaround: 'Manual WhatsApp & email follow-ups',
        rootCause: 'Lack of automated client portal and scheduled reminders',
        solutionGap: 'Clients use unstructured channels (WhatsApp photos, email attachments)',
        confidence: 0.85,
        status: 'investigating',
        evidenceIds: [answer.questionId]
      });
    }

    if (text.includes('whatsapp') || text.includes('email') || options.some(o => o.toLowerCase().includes('whatsapp'))) {
      facts.push({
        id: `fact-${Date.now()}-task`,
        category: 'team',
        key: 'taskAssignmentMethod',
        value: options.find(o => o.toLowerCase().includes('whatsapp')) || 'WhatsApp / Unstructured Email',
        confidence: 0.9
      });
    }

    return { facts, problems };
  }

  private applyFactsToState(state: BusinessState, facts: BusinessFact[]) {
    facts.forEach(f => {
      if (f.key === 'industry') state.business.industry = f.value;
      if (f.key === 'employeeCount') state.business.employeeCount = f.value;
      if (f.key === 'clientCount') state.business.clientCount = f.value;
      if (f.key === 'taskAssignmentMethod') state.team.taskAssignmentMethod = f.value;
    });
  }

  /**
   * Deterministic Adaptive Reasoning Engine adhering to PRD Sections 6, 8, 9, 10, 14
   */
  private runFallbackReasoningEngine(
    state: BusinessState,
    recentAnswers: AnswerRecord[],
    extractedFacts: BusinessFact[],
    detectedProblems: ProblemRecord[]
  ): AIReasoningResult {
    const qCount = state.questionCount;
    let phase: BusinessState['interviewPhase'] = 'overview';
    let action: AIReasoningResult['action'] = 'ask_question';
    let objective = 'establish_business_context';
    let question: QuestionObject;

    // Check if we have active problem that needs deep dive (PRD Section 14)
    const activeProblem = state.problems.find(p => p.status === 'investigating' || p.severity >= 7);

    if (qCount === 1) {
      phase = 'overview';
      objective = 'establish_business_context';
      question = {
        id: 'q-1',
        text: 'What primary services does your accounting firm provide?',
        type: 'multiple_choice',
        options: [
          'Tax Preparation & Filing',
          'Monthly Bookkeeping & Accounting',
          'Payroll Processing',
          'Audit & Advisory Services',
          'Financial Reporting'
        ],
        required: true,
        objective,
        category: 'business_overview',
        phase,
        sequence: 1
      };
    } else if (qCount === 2) {
      phase = 'overview';
      objective = 'quantify_team_scale';
      question = {
        id: 'q-2',
        text: 'How many total employees or accountants work in your firm?',
        type: 'short_text',
        required: true,
        objective,
        category: 'business_overview',
        phase,
        sequence: 2
      };
    } else if (qCount === 3) {
      phase = 'team';
      objective = 'identify_task_assignment_method';
      question = {
        id: 'q-3',
        text: 'How are daily client tasks and deadlines usually assigned to your team?',
        type: 'single_choice',
        options: [
          'WhatsApp / Phone messages',
          'Email threads',
          'Spreadsheet trackers (Excel / Google Sheets)',
          'Dedicated Project Management Software (e.g. Asana, ClickUp)',
          'Verbal / In-person meetings'
        ],
        required: true,
        objective,
        category: 'team_organization',
        phase,
        sequence: 3
      };
    } else if (qCount === 4) {
      phase = 'operations';
      objective = 'identify_primary_tools';
      question = {
        id: 'q-4',
        text: 'Which primary software tools do you use for accounting and client management?',
        type: 'multiple_choice',
        options: [
          'QuickBooks Online / Desktop',
          'Xero',
          'Sage',
          'Custom Spreadsheets',
          'Generic CRM / Email',
          'Paper records'
        ],
        required: true,
        objective,
        category: 'technology_stack',
        phase,
        sequence: 4
      };
    } else if (qCount === 5) {
      phase = 'problem_detection';
      objective = 'detect_biggest_operational_bottleneck';
      question = {
        id: 'q-5',
        text: 'Where does your team experience the most friction or lost time in weekly operations?',
        type: 'single_choice',
        options: [
          'Chasing clients for receipts, invoices & documents',
          'Manual data entry into accounting software',
          'Unclear task ownership and missed client deadlines',
          'Calculating and processing client payroll on time',
          'Reconciling bank accounts with missing information'
        ],
        required: true,
        objective,
        category: 'problem_detection',
        phase,
        sequence: 5
      };
    } else if (qCount === 6 && activeProblem) {
      // Problem Deep Dive (PRD Section 14)
      phase = 'deep_dive';
      action = 'investigate_problem';
      objective = 'quantify_time_impact';
      question = {
        id: 'q-6',
        text: `Approximately how many hours per week does your team spend on ${activeProblem.title.toLowerCase()}?`,
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
        sequence: 6
      };
    } else if (qCount === 7 && activeProblem) {
      phase = 'deep_dive';
      action = 'investigate_problem';
      objective = 'identify_current_workaround';
      question = {
        id: 'q-7',
        text: 'What current manual workarounds or steps do you use when this bottleneck occurs?',
        type: 'short_text',
        required: true,
        objective,
        category: 'problem_deep_dive',
        phase,
        sequence: 7
      };
    } else if (qCount === 8) {
      phase = 'deep_dive';
      objective = 'identify_consequences';
      question = {
        id: 'q-8',
        text: 'What is the biggest operational or financial consequence when these delays happen?',
        type: 'single_choice',
        options: [
          'Late tax filing penalties or client complaints',
          'Accountants working unpaid overtime during tax season',
          'Inability to onboard more clients due to capacity limits',
          'High employee stress and turnover'
        ],
        required: true,
        objective,
        category: 'problem_deep_dive',
        phase,
        sequence: 8
      };
    } else {
      // Completion trigger (PRD Section 18)
      phase = 'validation';
      action = 'validate_summary';
      objective = 'human_validation';
      question = {
        id: `q-${qCount}`,
        text: 'Based on our conversation, I have summarized our understanding. Is this operational breakdown accurate?',
        type: 'single_choice',
        options: [
          "Yes, that's accurate",
          "Mostly accurate, but something is missing",
          "No, I need to correct it"
        ],
        required: true,
        objective,
        category: 'final_validation',
        phase,
        sequence: qCount
      };
    }

    return {
      action,
      phase,
      objective,
      reasoningSummary: `Selected objective '${objective}' for phase '${phase}' based on question count ${qCount} and extracted facts.`,
      question,
      extractedFacts,
      detectedProblems,
      stateUpdates: []
    };
  }

  private async callLLMReasoning(
    state: BusinessState,
    recentAnswers: AnswerRecord[]
  ): Promise<AIReasoningResult | null> {
    if (!this.client) return null;

    const messages = [
      { role: 'system' as const, content: SYSTEM_INTERVIEWER_PROMPT },
      {
        role: 'user' as const,
        content: JSON.stringify({
          currentBusinessState: state,
          recentAnswers,
          targetDistribution: { choice: '60-70%', short: '20-30%', open: '5-10%' },
        }),
      },
    ];

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed as AIReasoningResult;
  }

  /**
   * Generates validation summary prior to report creation (PRD Section 19)
   */
  generateValidationSummary(state: BusinessState): ValidationSummary {
    const topProblems = state.problems
      .map(p => ({
        title: p.title,
        summary: p.description || p.rootCause,
        severity: p.severity,
      }))
      .slice(0, 3);

    return {
      businessOverview: `${state.business.industry || 'Accounting Firm'} operating with ${state.business.employeeCount || 'multiple'} staff members.`,
      teamAndRoles: `Task assignment method: ${state.team.taskAssignmentMethod || 'Manual communication / spreadsheets'}.`,
      primaryTools: `Core accounting & tech stack: ${state.technology.accountingSoftware?.join(', ') || 'Spreadsheets, WhatsApp, Email'}.`,
      keyWorkflows: ['Client Document Collection', 'Tax Preparation & Filing', 'Monthly Reconciliation'],
      topProblems: topProblems.length > 0 ? topProblems : [
        {
          title: 'Client document collection & reminder delays',
          summary: 'Chasing clients manually via WhatsApp/email leads to bottlenecks.',
          severity: 8,
        },
      ],
    };
  }

  /**
   * Generates the final structured Business Discovery Report (PRD Section 20 & 21)
   */
  generateReport(state: BusinessState, validationChoice?: string): DiscoveryReport {
    const scoredProblems = (state.problems.length > 0 ? state.problems : [
      {
        id: 'prob-default-1',
        title: 'Client Document Collection Delay',
        description: 'Accountants spend excessive time chasing clients for receipts, bank statements, and tax invoices.',
        category: 'client_operations',
        affectedPeople: ['Accountants', 'Clients'],
        frequency: 'weekly' as const,
        severity: 8,
        timeImpact: 'high' as const,
        financialImpact: '5-10 hours lost per accountant per week (~$12,000/yr lost capacity)',
        customerImpact: 'Delays in filing lead to client stress and late fees',
        currentWorkaround: 'Manual WhatsApp messages and unorganized email follow-ups',
        rootCause: 'Lack of automated client document portal with scheduled SMS/Email reminders',
        solutionGap: 'Fragmented communications without structured submission deadlines',
        confidence: 0.9,
        status: 'confirmed' as const,
        evidenceIds: ['q-5', 'q-6']
      },
      {
        id: 'prob-default-2',
        title: 'Unstructured Task Ownership & Communication Gap',
        description: 'Daily accounting tasks assigned via WhatsApp lead to missed deadlines and lack of visibility.',
        category: 'team_operations',
        affectedPeople: ['Firm Partners', 'Junior Accountants'],
        frequency: 'daily' as const,
        severity: 7,
        timeImpact: 'medium' as const,
        financialImpact: 'High rework rates and repeated status update meetings',
        customerImpact: 'Inconsistent service delivery speed',
        currentWorkaround: 'Daily verbal check-ins and shared Excel sheets',
        rootCause: 'No centralized practice management workflow system tailored for accounting deadlines',
        solutionGap: 'Generic chat tools lack task status tracking and automated escalation',
        confidence: 0.85,
        status: 'confirmed' as const,
        evidenceIds: ['q-3']
      }
    ]).map(p => {
      const score = calculateOpportunityScore(p);
      return {
        ...p,
        score,
        evidenceList: [
          `Confirmed in interview turn (${p.frequency} frequency)`,
          `Workaround cited: ${p.currentWorkaround}`,
          `Root cause: ${p.rootCause}`
        ]
      };
    }).sort((a, b) => b.score - a.score);

    return {
      id: `rep-${Date.now()}`,
      interviewId: `int-${Date.now()}`,
      createdAt: new Date().toISOString(),
      executiveSummary: `This business discovery report analyzes operational workflows for a ${state.business.employeeCount || 12}-person ${state.business.industry || 'Accounting'} firm. The primary bottleneck identified is manual client document collection, causing significant time loss during recurring filing cycles.`,
      businessProfile: {
        industry: state.business.industry || 'Accounting & Financial Services',
        employeeCount: state.business.employeeCount || 12,
        clientCount: state.business.clientCount || 85,
        businessModel: 'Recurring Retainer & Seasonal Tax Services',
        services: ['Tax Preparation', 'Monthly Bookkeeping', 'Payroll Processing', 'Financial Advisory'],
        targetClients: ['Small to Medium Enterprises (SMEs)', 'Individual Taxpayers']
      },
      teamStructure: {
        roles: ['Partner / Owner', 'Senior Accountants', 'Junior Bookkeepers', 'Administrative Support'],
        taskAssignment: state.team.taskAssignmentMethod || 'WhatsApp / Email / Spreadsheets',
        communicationTools: ['WhatsApp', 'Email', 'Excel'],
        accountabilityMethod: 'Weekly status meetings and manual check-ins'
      },
      technologyStack: {
        coreTools: ['QuickBooks Online / Xero', 'Microsoft Excel', 'WhatsApp Business', 'Outlook Email'],
        informationFlow: 'Information moves manually from WhatsApp photos and email attachments into Excel spreadsheets, then manually keyed into accounting software.',
        manualGaps: ['Client document portal', 'Automated client reminder sequences', 'Centralized task tracking']
      },
      workflowMap: [
        {
          name: 'Client Onboarding & Tax Document Collection',
          trigger: 'Tax season launch / Monthly bookkeeping cycle',
          steps: [
            { stepNumber: 1, name: 'Send initial request list', role: 'Junior Accountant', tool: 'Email', painLevel: 3 },
            { stepNumber: 2, name: 'Follow up on missing documents', role: 'Senior Accountant', tool: 'WhatsApp / Phone', painLevel: 9 },
            { stepNumber: 3, name: 'Verify & organize received files', role: 'Bookkeeper', tool: 'Cloud Folder / Excel', painLevel: 6 },
            { stepNumber: 4, name: 'Data entry into accounting system', role: 'Senior Accountant', tool: 'QuickBooks / Xero', painLevel: 5 }
          ],
          bottlenecks: ['Step 2: Unstructured WhatsApp chasing causes 5-10 day delays in receiving complete client files.']
        }
      ],
      rankedProblems: scoredProblems,
      opportunityValidation: [
        {
          areaToValidate: 'Automated Client Document Portal with WhatsApp/SMS Reminders',
          rationale: 'High pain score (Severity 8) and daily time loss. Clients already use WhatsApp, so a dedicated upload link via automated message removes friction.',
          recommendedExperiments: ['Test a 2-week trial using an automated document upload portal with 10 existing clients to measure document return speed vs WhatsApp chasing.']
        },
        {
          areaToValidate: 'Practice Management & Task Ownership Dashboard',
          rationale: 'Improves team visibility and eliminates manual status checking meetings.',
          recommendedExperiments: ['Implement lightweight accounting task templates to track deadline status per client automatically.']
        }
      ]
    };
  }
}
