import { GoogleGenAI } from "@google/genai";
import { AIProvider, GenerateAgentInput, AgentModelResponse } from "../provider";
import { agentResponseSchema } from "../schemas";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.AI_MODEL || "gemini-2.5-flash";

    if (apiKey && apiKey !== "mock-key" && apiKey !== "your_gemini_api_key_here") {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  async generateAgentResponse(input: GenerateAgentInput): Promise<AgentModelResponse> {
    if (!this.client) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: `SYSTEM INSTRUCTION:\n${input.systemInstruction}\n\nCONTEXT:\n${input.context}` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini model.");
    }

    // Structured Output Validation via Zod (Section 6)
    const jsonParsed = JSON.parse(text);
    const validated = agentResponseSchema.parse(jsonParsed);

    return validated as AgentModelResponse;
  }
}
