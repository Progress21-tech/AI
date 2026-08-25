import { InterviewState } from "@/lib/ai/types";

export function calculateServerTimer(state: InterviewState): {
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  mode: "normal" | "focus" | "deep_dive" | "wrap_up";
} {
  const startedMs = new Date(state.startedAt).getTime();
  const nowMs = Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  const targetSeconds = state.targetDurationSeconds || 720;
  const estimatedRemainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

  let mode: "normal" | "focus" | "deep_dive" | "wrap_up" = state.timeMode || "normal";
  if (estimatedRemainingSeconds <= 120 || state.questionsAsked >= 8) {
    mode = "wrap_up";
  }

  return { elapsedSeconds, estimatedRemainingSeconds, mode };
}
