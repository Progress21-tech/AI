import { getAIProvider } from "@/lib/ai/registry";
import { InterviewState } from "@/lib/ai/types";
import { RUNTIME_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildAgentContext } from "./state";
import { calculateServerTimer } from "./timer";

/**
 * Provider-agnostic Agent Runtime execution engine (Section 8 Specification).
 * Never imports GoogleGenAI or provider-specific code directly.
 */
export async function runAgent(state: InterviewState) {
  const ai = getAIProvider();
  const timeMetrics = calculateServerTimer(state);

  const updatedState: InterviewState = {
    ...state,
    elapsedSeconds: timeMetrics.elapsedSeconds,
    estimatedRemainingSeconds: timeMetrics.estimatedRemainingSeconds,
    timeMode: timeMetrics.mode
  };

  const agentResponse = await ai.generateAgentResponse({
    systemInstruction: RUNTIME_SYSTEM_PROMPT,
    context: buildAgentContext(updatedState)
  });

  return {
    response: agentResponse,
    updatedState
  };
}
