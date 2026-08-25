import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { AIRecommendation, DiscoveryReport, InterviewState } from './types';

const aiRecommendationSchema = z.object({
    title: z.string().min(1),
    type: z.string().min(1),
    problem_solved: z.string().min(1),
    evidence: z.array(z.string()).min(1),
    why_it_matters: z.string().min(1),
    expected_impact: z.string().min(1),
    priority: z.string().min(1),
    implementation_difficulty: z.string().min(1),
    suggested_approach: z.string().min(1),
    next_step: z.string().min(1),
});

const aiReportSchema = z.object({
    executive_summary: z.string().min(1),
    business_profile: z.object({
        industry: z.string(),
        employee_count: z.number().nonnegative(),
        client_count: z.number().nonnegative(),
        business_model: z.string(),
        services: z.array(z.string()),
        target_clients: z.array(z.string()),
    }),
    team_structure: z.object({
        roles: z.array(z.string()),
        task_assignment: z.string(),
        communication_tools: z.array(z.string()),
        accountability_method: z.string(),
    }),
    technology_stack: z.object({
        core_tools: z.array(z.string()),
        information_flow: z.string(),
        manual_gaps: z.array(z.string()),
    }),
    workflow_map: z.array(z.object({
        name: z.string(),
        trigger: z.string(),
        steps: z.array(z.object({ name: z.string(), role: z.string(), tool: z.string(), pain_level: z.number().min(0).max(10) })),
        bottlenecks: z.array(z.string()),
    })),
    major_problems: z.array(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string(),
        affected_people: z.array(z.string()),
        frequency: z.string().nullable(),
        severity: z.number().min(0).max(10).nullable(),
        time_impact: z.string().nullable(),
        financial_impact: z.string().nullable(),
        customer_impact: z.string().nullable(),
        current_workaround: z.string().nullable(),
        root_cause: z.string().nullable(),
        confidence: z.number().min(0).max(1),
        evidence: z.array(z.string()).min(1),
    })),
    recommendations: z.array(aiRecommendationSchema),
    roadmap: z.object({
        immediate_actions: z.array(z.string()),
        short_term_actions: z.array(z.string()),
        medium_term_actions: z.array(z.string()),
        long_term_opportunities: z.array(z.string()),
    }),
});

export interface AIReportInput {
    state: InterviewState;
    company: unknown;
    questions: unknown[];
    answers: unknown[];
    businessFacts: unknown[];
    workflows: unknown[];
    problems: unknown[];
    desiredOutcome: unknown;
    validationChoice?: string;
    correctionText?: string;
}

export interface AIReportResult {
    report: DiscoveryReport;
    recommendations: AIRecommendation[];
    rawOutput: unknown;
}

const REPORT_SYSTEM_PROMPT = `You are a senior business strategist and technology consultant.
Analyze the complete business discovery interview provided by the server.
Use only facts, answers, workflows, and problems present in the evidence.
Never invent a problem, impact, metric, tool, root cause, or recommendation evidence.
Every major problem and every recommendation must cite concrete interview evidence.
Separate observed facts from reasonable, explicitly qualified inferences.
Identify major business problems, root causes, operational inefficiencies, automation opportunities,
software opportunities, AI opportunities, integration opportunities, and process improvements.
Return ONLY valid JSON matching the requested schema. Do not include markdown or commentary.`;

function toRecommendation(value: z.infer<typeof aiRecommendationSchema>): AIRecommendation {
    return {
        title: value.title,
        type: value.type,
        problemSolved: value.problem_solved,
        evidence: value.evidence,
        whyItMatters: value.why_it_matters,
        expectedImpact: value.expected_impact,
        priority: value.priority,
        implementationDifficulty: value.implementation_difficulty,
        suggestedApproach: value.suggested_approach,
        nextStep: value.next_step,
    };
}

export async function generateAIReport(input: AIReportInput): Promise<AIReportResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'mock-key' || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is missing or unconfigured');
    }

    const model = process.env.AI_MODEL || 'gemini-2.5-flash';
    const startedAt = Date.now();
    console.info('[AI_REPORT] request_started', { model, interviewId: input.state.interviewId });

    try {
        const client = new GoogleGenAI({ apiKey });
        const response = await client.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: `${REPORT_SYSTEM_PROMPT}\n\nINTERVIEW EVIDENCE:\n${JSON.stringify(input)}` }] }],
            config: { responseMimeType: 'application/json' },
        });
        const rawOutput = JSON.parse(response.text || '{}');
        const parsed = aiReportSchema.parse(rawOutput);
        const recommendations = parsed.recommendations.map(toRecommendation);
        const report: DiscoveryReport = {
            id: `rep-${input.state.interviewId}`,
            interviewId: input.state.interviewId,
            createdAt: new Date().toISOString(),
            source: 'ai',
            executiveSummary: parsed.executive_summary,
            businessProfile: {
                industry: parsed.business_profile.industry,
                employeeCount: parsed.business_profile.employee_count,
                clientCount: parsed.business_profile.client_count,
                businessModel: parsed.business_profile.business_model,
                services: parsed.business_profile.services,
                targetClients: parsed.business_profile.target_clients,
            },
            teamStructure: {
                roles: parsed.team_structure.roles,
                taskAssignment: parsed.team_structure.task_assignment,
                communicationTools: parsed.team_structure.communication_tools,
                accountabilityMethod: parsed.team_structure.accountability_method,
            },
            technologyStack: {
                coreTools: parsed.technology_stack.core_tools,
                informationFlow: parsed.technology_stack.information_flow,
                manualGaps: parsed.technology_stack.manual_gaps,
            },
            workflowMap: parsed.workflow_map.map((workflow) => ({
                name: workflow.name,
                trigger: workflow.trigger,
                steps: workflow.steps.map((step, index) => ({ stepNumber: index + 1, name: step.name, role: step.role, tool: step.tool, painLevel: step.pain_level })),
                bottlenecks: workflow.bottlenecks,
            })),
            rankedProblems: parsed.major_problems.map((problem, index) => ({
                id: `ai-problem-${index + 1}`,
                title: problem.title,
                description: problem.description,
                category: problem.category,
                affectedPeople: problem.affected_people,
                frequency: ['daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc'].includes(problem.frequency || '') ? problem.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc' : null,
                severity: problem.severity,
                timeImpact: ['low', 'medium', 'high'].includes(problem.time_impact || '') ? problem.time_impact as 'low' | 'medium' | 'high' : null,
                financialImpact: problem.financial_impact,
                customerImpact: problem.customer_impact,
                currentWorkaround: problem.current_workaround,
                rootCause: problem.root_cause,
                confidence: problem.confidence,
                status: 'confirmed',
                evidenceIds: problem.evidence,
                score: Math.round(problem.confidence * 100),
                evidenceList: problem.evidence,
            })),
            opportunityValidation: recommendations.map((recommendation) => ({
                areaToValidate: recommendation.title,
                rationale: `${recommendation.whyItMatters} Evidence: ${recommendation.evidence.join('; ')}`,
                recommendedExperiments: [recommendation.nextStep],
            })),
            recommendations,
            implementationRoadmap: {
                immediateActions: parsed.roadmap.immediate_actions,
                shortTermActions: parsed.roadmap.short_term_actions,
                mediumTermActions: parsed.roadmap.medium_term_actions,
                longTermOpportunities: parsed.roadmap.long_term_opportunities,
            },
        };
        console.info('[AI_REPORT] success', { model, interviewId: input.state.interviewId, latencyMs: Date.now() - startedAt });
        return { report, recommendations, rawOutput };
    } catch (error) {
        console.error('[AI_REPORT] failure', { model, interviewId: input.state.interviewId, latencyMs: Date.now() - startedAt, error: error instanceof z.ZodError ? 'validation_failure' : 'provider_failure' });
        throw error;
    }
}