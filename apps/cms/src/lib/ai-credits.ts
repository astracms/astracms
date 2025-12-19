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
  "analyze-seo": 30, // tool id is "analyze-seo"
  "add-category": 15,
  "add-tag": 15,
  search: 20,
  "web-search": 30,

  // Complex operations (50-100 credits)
  "create-post": 50,
  "update-post": 40,
  "content-strategy": 75,
  // create-blog-auto uses internal generateWithAI calls that track their own costs
  // Setting to 0 to avoid double-charging (internal ops: title=2, category=1, content=12, desc=2, tags=1 = ~18 total)
  "create-blog-auto": 0,

  // Internal AI generation operations (used by tools via generateWithAI)
  // Costs optimized so free users (100 credits) can create ~5 blog posts
  "blog-title-generation": 2,
  "blog-category-selection": 1,
  "blog-content-generation": 12,
  "blog-description-generation": 2,
  "blog-tags-generation": 1,
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

  if (workspace?.subscription) {
    // Has subscription - return tracked usage
    return workspace.subscription.aiCreditsUsed;
  }

  // No subscription (free plan) - calculate from usage events
  return calculateUsageFromEvents(workspaceId);
}

/**
 * Get the start of the current billing period (first day of the month)
 */
function getBillingPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Calculate AI credits used from usage events for workspaces without subscription
 */
async function calculateUsageFromEvents(workspaceId: string): Promise<number> {
  const billingPeriodStart = getBillingPeriodStart();

  const usageEvents = await db.usageEvent.findMany({
    where: {
      workspaceId,
      type: "ai_generation",
      createdAt: {
        gte: billingPeriodStart,
      },
    },
    select: {
      metadata: true,
    },
  });

  return usageEvents.reduce((total, event) => {
    const metadata = event.metadata as { creditsConsumed?: number } | null;
    return total + (metadata?.creditsConsumed ?? 0);
  }, 0);
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

    // Get plan type and limits
    const planType = getWorkspacePlan(workspace?.subscription);
    const planLimits = PLAN_LIMITS[planType];

    // Check if plan has AI access
    if (!planLimits.features.aiAccess) {
      return {
        success: false,
        remainingCredits: 0,
        error: "AI features are not available on your current plan",
      };
    }

    let currentUsage: number;
    let creditLimit: number;

    if (workspace?.subscription) {
      // Has subscription - use subscription tracking
      currentUsage = workspace.subscription.aiCreditsUsed;
      creditLimit =
        workspace.subscription.aiCreditsLimit > 0
          ? workspace.subscription.aiCreditsLimit
          : planLimits.aiCreditsPerMonth;
    } else {
      // No subscription (free plan) - calculate usage from events
      currentUsage = await calculateUsageFromEvents(workspaceId);
      creditLimit = planLimits.aiCreditsPerMonth;
    }

    const newUsage = currentUsage + creditsToConsume;

    // Check if this would exceed the limit
    if (newUsage > creditLimit) {
      return {
        success: false,
        remainingCredits: Math.max(0, creditLimit - currentUsage),
        error: "Insufficient AI credits",
      };
    }

    // Update subscription usage if exists
    if (workspace?.subscription) {
      await db.subscription.update({
        where: { id: workspace.subscription.id },
        data: {
          aiCreditsUsed: newUsage,
        },
      });
    }

    // Always log usage event (this tracks usage for all users including free plan)
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
      remainingCredits: creditLimit - newUsage,
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

  let aiCreditsUsed: number;
  let aiCreditsLimit: number;

  if (workspace?.subscription) {
    // Has subscription - use subscription tracking
    aiCreditsUsed = workspace.subscription.aiCreditsUsed;
    aiCreditsLimit =
      workspace.subscription.aiCreditsLimit > 0
        ? workspace.subscription.aiCreditsLimit
        : planLimits.aiCreditsPerMonth;
  } else {
    // No subscription (free plan) - calculate from usage events
    aiCreditsUsed = await calculateUsageFromEvents(workspaceId);
    aiCreditsLimit = planLimits.aiCreditsPerMonth;
  }

  const remaining = Math.max(0, aiCreditsLimit - aiCreditsUsed);
  const usagePercentage =
    aiCreditsLimit > 0 ? (aiCreditsUsed / aiCreditsLimit) * 100 : 0;

  return {
    used: aiCreditsUsed,
    limit: aiCreditsLimit,
    remaining,
    usagePercentage: Math.min(100, usagePercentage),
    canUseAI:
      planLimits.features.aiAccess && aiCreditsLimit > 0 && remaining > 0,
  };
}
