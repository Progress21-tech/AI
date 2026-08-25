import { AIProvider, GenerateAgentInput, AgentModelResponse } from "../provider";

export class FallbackProvider implements AIProvider {
  async generateAgentResponse(input: GenerateAgentInput): Promise<AgentModelResponse> {
    const context = input.context.toLowerCase();
    let questionsAsked = 1;

    try {
      const parsed = JSON.parse(input.context) as { questionsAsked?: number };
      questionsAsked = parsed.questionsAsked ?? 1;
    } catch {
      // Keep default when context is not JSON.
    }

    let questionText = "What primary product or service does your business provide to clients?";
    let questionType: "single_choice" | "multiple_choice" | "short_text" | "number" = "single_choice";
    let options: string[] = [
      "Tax Preparation & Bookkeeping Services",
      "Legal & Advisory Firm",
      "Freight & Logistics Management",
      "Healthcare / Clinic",
      "Manufacturing & Supply Chain",
      "Other Professional Services"
    ];
    let objective = "establish_business_context";
    let phase = "orientation";
    let mode: "normal" | "focus" | "deep_dive" | "wrap_up" = "normal";

    if (questionsAsked >= 8) {
      questionText = "Before I finalize the report, what is the single most important correction you want me to make?";
      questionType = "short_text";
      options = [];
      objective = "final_validation";
      phase = "validation";
      mode = "wrap_up";
    } else if (questionsAsked >= 4 || context.includes("quickbooks") || context.includes("excel")) {
      questionText = "Where does your team experience the most recurring friction or lost time in daily operations?";
      questionType = "single_choice";
      options = [
        "Chasing clients for receipts, invoices & documents",
        "Manual data entry into accounting software",
        "Unclear task ownership and missed deadlines",
        "Calculating and processing payroll on time",
        "Bank reconciliation errors and missing info"
      ];
      objective = "detect_biggest_operational_bottleneck";
      phase = "problem_discovery";
      mode = "focus";
    } else if (questionsAsked >= 3 || context.includes("whatsapp") || context.includes("task")) {
      questionText = "Which primary software tools do you use for accounting and managing operations?";
      questionType = "multiple_choice";
      options = [
        "QuickBooks Online / Desktop",
        "Xero",
        "Sage",
        "Spreadsheets (Excel / Google Sheets)",
        "Email / Messaging apps",
        "Paper files"
      ];
      objective = "identify_tech_stack";
      phase = "operations";
    } else if (questionsAsked >= 2 || context.includes("employees") || context.includes("staff")) {
      questionText = "How are daily client tasks usually assigned across your team?";
      questionType = "single_choice";
      options = [
        "WhatsApp / Phone messages",
        "Email threads",
        "Spreadsheet trackers (Excel / Google Sheets)",
        "Dedicated Project Management Software (e.g. Asana, ClickUp)",
        "Verbal / In-person check-ins"
      ];
      objective = "identify_task_assignment";
      phase = "business_mapping";
    }

    return {
      action: "ask_question",
      phase,
      objective,
      question: {
        text: questionText,
        type: questionType,
        options
      },
      stateUpdates: {
        facts: [],
        problems: [],
        unknowns: []
      },
      timer: {
        mode,
        estimatedRemainingSeconds: 600
      },
      confidence: 0.95
    };
  }
}
