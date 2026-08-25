import { z } from "zod";

export const agentResponseSchema = z.object({
  action: z.enum([
    "ask_question",
    "investigate_problem",
    "change_category",
    "validate_summary",
    "finish_interview"
  ]),
  phase: z.string(),
  objective: z.string(),
  question: z.object({
    text: z.string(),
    type: z.enum([
      "single_choice",
      "multiple_choice",
      "short_text",
      "number"
    ]),
    options: z.array(z.string())
  }).nullable(),
  stateUpdates: z.object({
    facts: z.array(z.unknown()),
    problems: z.array(z.unknown()),
    unknowns: z.array(z.unknown())
  }),
  timer: z.object({
    mode: z.enum([
      "normal",
      "focus",
      "deep_dive",
      "wrap_up"
    ]),
    estimatedRemainingSeconds: z.number()
  }),
  confidence: z.number()
});
