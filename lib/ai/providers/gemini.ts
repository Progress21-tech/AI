import { GoogleGenAI } from "@google/genai";
import { AIProvider, GenerateAgentInput, AgentModelResponse } from "../provider";
import { agentResponseSchema } from "../schemas";
import { FallbackProvider } from "./fallback";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI | null = null;
  private modelName: string;
  private fallback: FallbackProvider;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.AI_MODEL || "gemini-2.5-flash";
    this.fallback = new FallbackProvider();

    if (apiKey && apiKey !== "mock-key" && apiKey !== "your_gemini_api_key_here") {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  async generateAgentResponse(input: GenerateAgentInput): Promise<AgentModelResponse> {
    if (!this.client) {
      console.warn("[GeminiProvider] GEMINI_API_KEY is missing or unconfigured. Utilizing FallbackProvider.");
      return this.fallback.generateAgentResponse(input);
    }

    try {
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
        throw new Error("Empty text returned from Gemini API");
      }

      // Structured Output Validation via Zod (Section 6)
      const jsonParsed = JSON.parse(text);
      const validated = agentResponseSchema.parse(jsonParsed);

      return validated as AgentModelResponse;
    } catch (error) {
      console.warn("[GeminiProvider] Error calling Gemini API or parsing schema. Falling back to deterministic reasoning engine:", error);
      return this.fallback.generateAgentResponse(input);
    }
  }
}
