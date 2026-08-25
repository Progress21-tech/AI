import { AIProvider } from "./provider";
import { GeminiProvider } from "./providers/gemini";
import { FallbackProvider } from "./providers/fallback";

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  switch (provider) {
    case "gemini":
      // If API key is not configured, fall back gracefully for dev/testing
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "mock-key") {
        console.warn("[AI Registry] GEMINI_API_KEY is unconfigured. Using FallbackProvider.");
        return new FallbackProvider();
      }
      return new GeminiProvider();
    default:
      console.warn(`[AI Registry] Unsupported or fallback provider: ${provider}`);
      return new FallbackProvider();
  }
}
