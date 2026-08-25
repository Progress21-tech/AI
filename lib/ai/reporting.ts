import { calculateOpportunityScore } from './scoring';
import { DiscoveryReport, InterviewState, ValidationSummary } from './types';

const DEFAULT_FALLBACK_FACT = 'Not enough structured evidence yet';

function pickFact(state: InterviewState, key: string): string {
    const found = state.businessFacts.find((fact) => fact.key === key && fact.value);
    return found ? String(found.value) : DEFAULT_FALLBACK_FACT;
}

function pickFactsByCategory(state: InterviewState, category: string): string[] {
    return state.businessFacts
        .filter((fact) => fact.category === category && fact.value)
        .map((fact) => String(fact.value));
}

export function generateValidationSummary(state: InterviewState): ValidationSummary {
    const topProblems = [...state.problems]
        .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))
        .slice(0, 3)
        .map((problem) => ({
            title: problem.title,
            summary: problem.description,
            severity: problem.severity ?? 5,
        }));

    return {
        businessOverview: pickFact(state, 'business_overview'),
        teamAndRoles: pickFact(state, 'team_and_roles'),
        primaryTools: pickFact(state, 'primary_tools'),
        keyWorkflows: state.workflows.length > 0
            ? state.workflows.map((workflow) => String((workflow as { name?: string }).name ?? 'Workflow'))
            : ['Workflow information still being captured'],
        topProblems,
    };
}

export function generateDiscoveryReport(
    state: InterviewState,
    validationChoice?: string,
    correctionText?: string
): DiscoveryReport {
    const rankedProblems = [...state.problems]
        .map((problem) => ({
            ...problem,
            score: calculateOpportunityScore(problem),
            evidenceList: problem.evidenceIds.length > 0
                ? problem.evidenceIds.map((id) => `Evidence reference: ${id}`)
                : ['No direct evidence references captured yet'],
        }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const topProblem = rankedProblems[0];

    return {
        id: `rep-${state.interviewId}`,
        interviewId: state.interviewId,
        createdAt: new Date().toISOString(),
        executiveSummary:
            correctionText ||
            `Interview completed with ${state.questionsAsked} questions. Primary focus area: ${topProblem?.title ?? 'Operational discovery'}. Validation choice: ${validationChoice ?? 'pending'}.`,
        businessProfile: {
            industry: pickFact(state, 'industry'),
            employeeCount: Number(pickFact(state, 'employee_count')) || 0,
            clientCount: Number(pickFact(state, 'client_count')) || 0,
            businessModel: pickFact(state, 'business_model'),
            services: pickFactsByCategory(state, 'services').slice(0, 6),
            targetClients: pickFactsByCategory(state, 'target_clients').slice(0, 6),
        },
        teamStructure: {
            roles: pickFactsByCategory(state, 'roles').slice(0, 8),
            taskAssignment: pickFact(state, 'task_assignment'),
            communicationTools: pickFactsByCategory(state, 'communication_tools').slice(0, 6),
            accountabilityMethod: pickFact(state, 'accountability_method'),
        },
        technologyStack: {
            coreTools: pickFactsByCategory(state, 'tools').slice(0, 8),
            informationFlow: pickFact(state, 'information_flow'),
            manualGaps: pickFactsByCategory(state, 'manual_gaps').slice(0, 8),
        },
        workflowMap: state.workflows.length > 0
            ? state.workflows.map((workflow, index) => ({
                name: String((workflow as { name?: string }).name ?? `Workflow ${index + 1}`),
                trigger: String((workflow as { trigger?: string }).trigger ?? 'Client or internal trigger'),
                steps: Array.isArray((workflow as { steps?: unknown[] }).steps)
                    ? ((workflow as { steps?: Array<{ name?: string; role?: string; tool?: string; painLevel?: number }> }).steps ?? []).map((step, stepIndex) => ({
                        stepNumber: stepIndex + 1,
                        name: step.name ?? `Step ${stepIndex + 1}`,
                        role: step.role ?? 'Unknown role',
                        tool: step.tool ?? 'Unknown tool',
                        painLevel: step.painLevel ?? 5,
                    }))
                    : [],
                bottlenecks: Array.isArray((workflow as { bottlenecks?: unknown[] }).bottlenecks)
                    ? ((workflow as { bottlenecks?: string[] }).bottlenecks ?? [])
                    : [],
            }))
            : [
                {
                    name: 'Primary workflow (in progress)',
                    trigger: 'Discovery interview in progress',
                    steps: [],
                    bottlenecks: ['More operational details needed'],
                },
            ],
        rankedProblems,
        opportunityValidation: rankedProblems.slice(0, 3).map((problem) => ({
            areaToValidate: problem.title,
            rationale: `High-impact area based on severity ${problem.severity ?? 5} and confidence ${Math.round(problem.confidence * 100)}%.`,
            recommendedExperiments: [
                'Run a 2-week baseline measurement for this workflow.',
                'Pilot one process change with the directly affected team.',
                'Track time saved, error rate, and customer impact after pilot.',
            ],
        })),
    };
}