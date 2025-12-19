import { db } from "@astra/db";
import { getWorkspacePlan, PLAN_LIMITS } from "./plans";

/**
 * AI Tool Credit Costs (moderate tier: 10-100 credits per operation)
 */
export const AI_TOOL_COSTS = {
  // Simple operations (10-15 credits)
  "readability-suggestions": 10,
  "list-resources": 10,
  "list-media": 10,
  "get-analytics": 10,
  "get-authors": 10,
  "get-workspace-details": 10,
  "auto-select-image": 15,

  // Medium operations (25-50 credits)
  "keyword-research": 25,
  "seo-analyzer": 30,
  "add-category": 15,
  "add-tag": 15,
  search: 20,
  "web-search": 30,

  // Complex operations (50-100 credits)
  "create-post": 50,
  "update-post": 40,
  "content-strategy": 75,
  "create-blog-auto": 100,
} as const;

export type AIToolName = keyof typeof AI_TOOL_COSTS;

/**
 * Get the credit cost for an AI tool
 */
export function getToolCreditCost(toolName: string): number {
  return AI_TOOL_COSTS[toolName as AIToolName] ?? 50; // Default to 50 if unknown
}

/**
 * Get current AI credit usage for a workspace in the current billing period
 */
export async function getAICreditUsage(workspaceId: string): Promise<number> {
  const workspace = await db.organization.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
    },
  });

  if (!workspace?.subscription) {
    return 0;
  }

  // Return current usage from subscription
  return workspace.subscription.aiCreditsUsed;
}

/**
 * Track AI credit consumption
 */
export async function consumeAICredits(
  workspaceId: string,
  toolName: string,
  creditsToConsume: number
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    const workspace = await db.organization.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: true,
      },
    });

    if (!workspace?.subscription) {
      return {
        success: false,
        remainingCredits: 0,
        error: "No active subscription found",
      };
    }

    const { subscription } = workspace;
    const newUsage = subscription.aiCreditsUsed + creditsToConsume;

    // Check if this would exceed the limit
    if (newUsage > subscription.aiCreditsLimit) {
      return {
        success: false,
        remainingCredits: Math.max(
          0,
          subscription.aiCreditsLimit - subscription.aiCreditsUsed
        ),
        error: "Insufficient AI credits",
      };
    }

    // Update subscription with new usage
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        aiCreditsUsed: newUsage,
      },
    });

    // Log usage event
    await db.usageEvent.create({
      data: {
        type: "ai_generation",
        workspaceId,
        metadata: {
          toolName,
          creditsConsumed: creditsToConsume,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      remainingCredits: subscription.aiCreditsLimit - newUsage,
    };
  } catch (error) {
    console.error("Error consuming AI credits:", error);
    return {
      success: false,
      remainingCredits: 0,
      error: "Failed to consume credits",
    };
  }
}

/**
 * Check if workspace has enough credits before executing a tool
 */
export async function checkAICreditAvailability(
  workspaceId: string,
  toolName: string
): Promise<{
  hasCredits: boolean;
  availableCredits: number;
  requiredCredits: number;
  error?: string;
}> {
  const requiredCredits = getToolCreditCost(toolName);

  try {
    const workspace = await db.organization.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: true,
      },
    });

    // Get plan type and default limits from plan configuration
    const planType = getWorkspacePlan(workspace?.subscription);
    const planLimits = PLAN_LIMITS[planType];

    // Check if plan has AI access
    if (!planLimits.features.aiAccess) {
      return {
        hasCredits: false,
        availableCredits: 0,
        requiredCredits,
        error: "AI features are not available on your current plan.",
      };
    }

    // Get used credits (0 if no subscription)
    const usedCredits = workspace?.subscription?.aiCreditsUsed ?? 0;
    // Use subscription limit if set, otherwise fall back to plan limits
    const creditLimit =
      workspace?.subscription?.aiCreditsLimit &&
      workspace.subscription.aiCreditsLimit > 0
        ? workspace.subscription.aiCreditsLimit
        : planLimits.aiCreditsPerMonth;

    const availableCredits = creditLimit - usedCredits;

    if (availableCredits < requiredCredits) {
      return {
        hasCredits: false,
        availableCredits: Math.max(0, availableCredits),
        requiredCredits,
        error: `Insufficient credits. You have ${Math.max(0, availableCredits)} credits but need ${requiredCredits}.`,
      };
    }

    return {
      hasCredits: true,
      availableCredits,
      requiredCredits,
    };
  } catch (error) {
    console.error("Error checking AI credit availability:", error);
    return {
      hasCredits: false,
      availableCredits: 0,
      requiredCredits,
      error: "Failed to check credit availability",
    };
  }
}

/**
 * Reset AI credits for a workspace (called during billing cycle renewal)
 */
export async function resetAICredits(subscriptionId: string): Promise<boolean> {
  try {
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        aiCreditsUsed: 0,
      },
    });
    return true;
  } catch (error) {
    console.error("Error resetting AI credits:", error);
    return false;
  }
}

/**
 * Get AI credit statistics for a workspace
 */
export async function getAICreditStats(workspaceId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  usagePercentage: number;
  canUseAI: boolean;
}> {
  const workspace = await db.organization.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
    },
  });

  // Get plan type and default limits from plan configuration
  const planType = getWorkspacePlan(workspace?.subscription);
  const planLimits = PLAN_LIMITS[planType];

  // If no subscription exists, use plan defaults (free plan has 100 credits)
  if (!workspace?.subscription) {
    return {
      used: 0,
      limit: planLimits.aiCreditsPerMonth,
      remaining: planLimits.aiCreditsPerMonth,
      usagePercentage: 0,
      canUseAI:
        planLimits.features.aiAccess && planLimits.aiCreditsPerMonth > 0,
    };
  }

  const { aiCreditsUsed } = workspace.subscription;
  // Use subscription limit if set, otherwise fall back to plan limits
  const aiCreditsLimit =
    workspace.subscription.aiCreditsLimit > 0
      ? workspace.subscription.aiCreditsLimit
      : planLimits.aiCreditsPerMonth;

  const remaining = Math.max(0, aiCreditsLimit - aiCreditsUsed);
  const usagePercentage =
    aiCreditsLimit > 0 ? (aiCreditsUsed / aiCreditsLimit) * 100 : 0;

  return {
    used: aiCreditsUsed,
    limit: aiCreditsLimit,
    remaining,
    usagePercentage: Math.min(100, usagePercentage),
    canUseAI: aiCreditsLimit > 0 && remaining > 0,
  };
}
