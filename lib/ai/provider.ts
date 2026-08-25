// Provider Interface Definition (Section 4 Specification)

export interface GenerateAgentInput {
  systemInstruction: string;
  context: string;
}

export interface AgentModelResponse {
  action: 
    | "ask_question" 
    | "investigate_problem" 
    | "change_category" 
    | "validate_summary" 
    | "finish_interview";
  phase: string;
  objective: string;
  question: {
    text: string;
    type: "single_choice" | "multiple_choice" | "short_text" | "number";
    options: string[];
  } | null;
  stateUpdates: {
    facts: unknown[];
    problems: unknown[];
    unknowns: unknown[];
  };
  timer: {
    mode: "normal" | "focus" | "deep_dive" | "wrap_up";
    estimatedRemainingSeconds: number;
  };
  confidence: number;
}

export interface AIProvider {
  generateAgentResponse(input: GenerateAgentInput): Promise<AgentModelResponse>;
}
