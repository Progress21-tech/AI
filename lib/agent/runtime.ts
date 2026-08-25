import { getAIProvider } from "@/lib/ai/registry";
import { InterviewState } from "@/lib/ai/types";
import { RUNTIME_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildAgentContext } from "./state";
import { calculateServerTimer } from "./timer";
import { FallbackProvider } from "@/lib/ai/providers/fallback";

/**
 * Provider-agnostic Agent Runtime execution engine.
 * Guarantees that API calls never return 500 error on AI provider failures.
 */
export async function runAgent(state: InterviewState) {
  const timeMetrics = calculateServerTimer(state);

  const updatedState: InterviewState = {
    ...state,
    elapsedSeconds: timeMetrics.elapsedSeconds,
    estimatedRemainingSeconds: timeMetrics.estimatedRemainingSeconds,
    timeMode: timeMetrics.mode
  };

  const agentInput = {
    systemInstruction: RUNTIME_SYSTEM_PROMPT,
    context: buildAgentContext(updatedState)
  };

  let agentResponse;

  try {
    const ai = getAIProvider();
    agentResponse = await ai.generateAgentResponse(agentInput);
  } catch (err) {
    console.error("[Agent Runtime] Provider call failed, utilizing FallbackProvider:", err);
    const fallback = new FallbackProvider();
    agentResponse = await fallback.generateAgentResponse(agentInput);
  }

  return {
    response: agentResponse,
    updatedState
  };
}
