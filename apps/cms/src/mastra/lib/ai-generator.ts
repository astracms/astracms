/**
 * AI Generation Helper
 *
 * Provides a simple utility for tools to generate AI content without
 * requiring access to the main agent instance. This solves the circular
 * dependency where tools need AI capabilities but can't access the agent.
 */
import { Agent } from "@mastra/core/agent";
import { consumeAICredits } from "@/lib/ai-credits";
import { parseAIError } from "@/lib/ai-error-handler";

/**
 * Generate AI text content using a lightweight agent
 *
 * @param prompt - The prompt to send to the AI
 * @param workspaceId - Workspace ID for credit tracking
 * @param operation - Operation name for credit tracking (default: "ai-generation")
 * @param creditCost - Credit cost override (default: 10 per generation)
 * @param model - Optional model override (default: grok-4-fast)
 * @returns Generated text content
 * @throws Error with user-friendly message if AI generation fails
 */
export async function generateWithAI(
  prompt: string,
  workspaceId?: string,
  operation = "ai-generation",
  creditCost = 10
): Promise<string> {
  try {
    // Create a lightweight agent just for generation
    // This doesn't need memory or complex configuration
    const agent = new Agent({
      name: "AI Generator",
      model: [
        {
          model: "zai/glm-4.6v-flash",
          maxRetries: 3,
        },
      ],
      instructions:
        "You are a helpful AI assistant that generates content based on user prompts. Follow instructions precisely and provide high-quality, relevant output.",
    });

    const response = await agent.generate([{ role: "user", content: prompt }]);

    // Track AI credit consumption if workspace ID is provided
    if (workspaceId) {
      const consumptionResult = await consumeAICredits(
        workspaceId,
        operation,
        creditCost
      );

      if (consumptionResult.success) {
        console.log(
          `[AI CREDITS] Consumed ${creditCost} credits for ${operation}. Remaining: ${consumptionResult.remainingCredits}`
        );
      } else {
        console.warn(
          `[AI CREDITS] Failed to consume credits for ${operation}:`,
          consumptionResult.error
        );
      }
    }

    return response.text || "";
  } catch (error) {
    // Parse and throw user-friendly error
    const aiError = parseAIError(error);
    console.error(`[AI GENERATOR] ${operation} failed:`, aiError.message);
    throw new Error(aiError.userMessage);
  }
}
