/**
 * AI Generation Helper
 *
 * Provides a simple utility for tools to generate AI content without
 * requiring access to the main agent instance. This solves the circular
 * dependency where tools need AI capabilities but can't access the agent.
 */
import { Agent } from "@mastra/core/agent";

/**
 * Generate AI text content using a lightweight agent
 *
 * @param prompt - The prompt to send to the AI
 * @param model - Optional model override (default: grok-4-fast)
 * @returns Generated text content
 */
export async function generateWithAI(
  prompt: string,
  model = "zenmux/x-ai/grok-4-fast"
): Promise<string> {
  // Create a lightweight agent just for generation
  // This doesn't need memory or complex configuration
  const agent = new Agent({
    name: "AI Generator",
    model,
    instructions:
      "You are a helpful AI assistant that generates content based on user prompts. Follow instructions precisely and provide high-quality, relevant output.",
  });

  const response = await agent.generate([{ role: "user", content: prompt }]);
  return response.text || "";
}
