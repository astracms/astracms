import { Agent } from "@mastra/core/agent";

/**
 * Create a Readability Analyzer agent
 * Used for analyzing content and providing readability improvement suggestions
 */
export function createReadabilityAgent() {
  return new Agent({
    name: "Readability Analyzer",
    instructions: `You are a writing assistant specializing in readability improvement.
Analyze content and provide specific, actionable suggestions to improve readability.
Focus on sentence structure, complex words, passive voice, and clarity.
Always respond with valid JSON containing a "suggestions" array.

Each suggestion should have:
- text: The main suggestion (1-2 sentences)
- explanation: Brief explanation (optional)
- textReference: Specific text from content to highlight (optional)`,
    model: [
      {
        model: "zai/glm-4.6v-flash",
        maxRetries: 3,
      },
    ],
  });
}

export type ReadabilityAgent = ReturnType<typeof createReadabilityAgent>;
