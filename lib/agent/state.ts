import { InterviewState } from "@/lib/ai/types";

/**
 * Builds clean provider-neutral context string from interview state
 */
export function buildAgentContext(state: InterviewState): string {
  return JSON.stringify({
    interviewId: state.interviewId,
    phase: state.phase,
    questionsAsked: state.questionsAsked,
    businessFacts: state.businessFacts,
    workflows: state.workflows,
    problems: state.problems,
    unknowns: state.unknowns,
    currentObjective: state.currentObjective,
    startedAt: state.startedAt,
    targetDurationSeconds: state.targetDurationSeconds,
    elapsedSeconds: state.elapsedSeconds,
    estimatedRemainingSeconds: state.estimatedRemainingSeconds,
    timeMode: state.timeMode
  }, null, 2);
}
