import type { Tool } from "@mastra/core/tools";
import {
  checkAICreditAvailability,
  consumeAICredits,
  getToolCreditCost,
} from "./ai-credits";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = Tool<any, any, any, any, any>;

/**
 * Wrap a Mastra tool with AI credit checking and consumption
 *
 * This wrapper:
 * 1. Checks if workspace has enough credits before execution
 * 2. Consumes credits after successful execution
 * 3. Returns credit error if insufficient credits
 */
export function wrapToolWithCreditCheck<T extends AnyTool>(
  tool: T,
  workspaceId: string
): T {
  // Ensure execute exists
  if (!tool.execute) {
    return tool;
  }

  const originalExecute = tool.execute.bind(tool);

  return {
    ...tool,
    execute: async (params: Parameters<typeof tool.execute>[0]) => {
      const toolName = tool.id;

      // Check if workspace has enough credits
      const creditCheck = await checkAICreditAvailability(
        workspaceId,
        toolName
      );

      if (!creditCheck.hasCredits) {
        return {
          success: false,
          error: creditCheck.error ?? "Insufficient AI credits",
          creditsRequired: creditCheck.requiredCredits,
          creditsAvailable: creditCheck.availableCredits,
        };
      }

      // Execute the original tool
      const result = await originalExecute(params);

      // Consume credits after successful execution
      const creditCost = getToolCreditCost(toolName);
      const consumptionResult = await consumeAICredits(
        workspaceId,
        toolName,
        creditCost
      );

      if (!consumptionResult.success) {
        console.warn(
          `[AI CREDITS] Failed to consume credits for tool ${toolName}:`,
          consumptionResult.error
        );
      }

      // Add credit info to result if it's an object
      if (typeof result === "object" && result !== null) {
        return {
          ...result,
          creditsUsed: creditCost,
          creditsRemaining: consumptionResult.remainingCredits,
        };
      }

      return result;
    },
  } as T;
}

/**
 * Wrap all tools in an object with credit checking
 */
export function wrapToolsWithCreditCheck<T extends Record<string, AnyTool>>(
  tools: T,
  workspaceId: string
): T {
  const wrappedTools: Record<string, AnyTool> = {};

  for (const key of Object.keys(tools)) {
    const tool = tools[key];
    if (tool) {
      wrappedTools[key] = wrapToolWithCreditCheck(tool, workspaceId);
    }
  }

  return wrappedTools as T;
}
