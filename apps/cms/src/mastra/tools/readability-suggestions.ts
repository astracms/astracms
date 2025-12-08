import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createReadabilityAgent } from "../agents/readability-agent";

/**
 * Schema for readability metrics input
 */
const metricsSchema = z.object({
  wordCount: z.number(),
  sentenceCount: z.number(),
  wordsPerSentence: z.number(),
  readabilityScore: z.number(),
  readingTime: z.number(),
});

/**
 * Schema for a single readability suggestion
 */
const suggestionSchema = z.object({
  text: z.string().describe("The main suggestion text (1-2 sentences)"),
  explanation: z
    .string()
    .optional()
    .describe("Brief explanation or example (optional, 1 sentence max)"),
  textReference: z
    .string()
    .optional()
    .describe("Specific text snippet to highlight (optional)"),
});

/**
 * Generate readability improvement suggestions for content
 * Uses a dedicated readability agent to analyze content and provide actionable suggestions
 */
export const createReadabilitySuggestionsTool = () => {
  // Create a dedicated readability agent for this tool
  const readabilityAgent = createReadabilityAgent();

  return createTool({
    id: "readability-suggestions",
    description:
      "Analyze content and provide specific, actionable suggestions to improve readability. Focus on sentence structure, complex words, passive voice, and clarity.",
    inputSchema: z.object({
      content: z.string().describe("The content to analyze for readability"),
      metrics: metricsSchema.describe(
        "Current readability metrics of the content"
      ),
    }),
    outputSchema: z.object({
      suggestions: z.array(suggestionSchema).max(8),
    }),
    execute: async ({ context }) => {
      const { content, metrics } = context;

      const prompt = `Analyze this content and provide specific, actionable suggestions to improve readability.

CONTENT:
${content.slice(0, 3000)}

METRICS:
- Word Count: ${metrics.wordCount}
- Sentence Count: ${metrics.sentenceCount}
- Words per Sentence: ${metrics.wordsPerSentence.toFixed(1)}
- Readability Score: ${metrics.readabilityScore.toFixed(1)}
- Reading Time: ${metrics.readingTime} min

Focus on:
- Sentence length and structure
- Complex words that could be simplified
- Passive voice usage
- Paragraph organization
- Clarity and conciseness

Respond with a JSON object containing 3-6 specific suggestions:
{
  "suggestions": [
    {
      "text": "Main suggestion (1-2 sentences)",
      "explanation": "Brief explanation (optional)",
      "textReference": "Specific text from content to highlight (optional)"
    }
  ]
}

Return ONLY valid JSON.`;

      try {
        const response = await readabilityAgent.generate(prompt);

        // Parse the response
        const text = response.text ?? "";

        // Try to extract JSON
        let json: unknown = null;
        try {
          json = JSON.parse(text);
        } catch {
          // Try to find JSON in the response
          const jsonMatch = text.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
          if (jsonMatch) {
            json = JSON.parse(jsonMatch[0]);
          }
        }

        if (json && typeof json === "object" && "suggestions" in json) {
          const parsed = z
            .object({ suggestions: z.array(suggestionSchema) })
            .safeParse(json);
          if (parsed.success) {
            return parsed.data;
          }
        }

        return { suggestions: [] };
      } catch (error) {
        console.error("Readability suggestions error:", error);
        return { suggestions: [] };
      }
    },
  });
};
