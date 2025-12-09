export type PlanType = "free" | "pro" | "team" | "enterprise";

export type PlanLimits = {
  maxMembers: number;
  maxMediaStorage: number;
  maxApiRequests: number;
  maxWebhookEvents: number;
  aiCreditsPerMonth: number;
  features: {
    inviteMembers: boolean;
    aiAccess: boolean;
    advancedReadability: boolean;
    keywordOptimization: boolean;
    unlimitedPosts: boolean;
  };
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxMembers: 2,
    maxMediaStorage: 1024, // 1GB
    maxApiRequests: 10_000,
    maxWebhookEvents: 0,
    aiCreditsPerMonth: 0,
    features: {
      inviteMembers: true,
      aiAccess: false,
      advancedReadability: false,
      keywordOptimization: false,
      unlimitedPosts: true,
    },
  },
  pro: {
    maxMembers: 5,
    maxMediaStorage: 10_240, // 10GB
    maxApiRequests: 50_000,
    maxWebhookEvents: 50,
    aiCreditsPerMonth: 1000,
    features: {
      inviteMembers: true,
      aiAccess: true,
      advancedReadability: true,
      keywordOptimization: false,
      unlimitedPosts: true,
    },
  },
  team: {
    maxMembers: 10,
    maxMediaStorage: 5120, // 5GB (kept for backward compatibility)
    maxApiRequests: -1, // unlimited
    maxWebhookEvents: 100,
    aiCreditsPerMonth: 10_000,
    features: {
      inviteMembers: true,
      aiAccess: true,
      advancedReadability: true,
      keywordOptimization: true,
      unlimitedPosts: true,
    },
  },
  enterprise: {
    maxMembers: 10,
    maxMediaStorage: 102_400, // 100GB
    maxApiRequests: -1, // unlimited
    maxWebhookEvents: 100,
    aiCreditsPerMonth: 10_000,
    features: {
      inviteMembers: true,
      aiAccess: true,
      advancedReadability: true,
      keywordOptimization: true,
      unlimitedPosts: true,
    },
  },
};

/**
 * Get the plan type from workspace subscription
 */
export function getWorkspacePlan(
  subscription?: { plan: string } | null
): PlanType {
  if (!subscription?.plan) {
    return "free";
  }

  const plan = subscription.plan.toLowerCase();
  if (plan === "pro") {
    return "pro";
  }
  if (plan === "team") {
    return "team";
  }
  if (plan === "enterprise") {
    return "enterprise";
  }

  return "free";
}

/**
 * Check if a workspace can perform a specific action based on their plan
 */
export function canPerformAction(
  plan: PlanType,
  action: keyof PlanLimits["features"]
): boolean {
  return PLAN_LIMITS[plan].features[action];
}

/**
 * Check if a workspace is within their member limit
 */
export function canInviteMoreMembers(
  plan: PlanType,
  currentMemberCount: number
): boolean {
  const limits = PLAN_LIMITS[plan];
  return (
    currentMemberCount < limits.maxMembers && limits.features.inviteMembers
  );
}

/**
 * Get remaining member slots for a workspace
 */
export function getRemainingMemberSlots(
  plan: PlanType,
  currentMemberCount: number
): number {
  const maxMembers = PLAN_LIMITS[plan].maxMembers;
  return Math.max(0, maxMembers - currentMemberCount);
}

/**
 * Get plan limits for a specific plan
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Check if current usage exceeds plan limits
 */
export function isOverLimit(
  plan: PlanType,
  usage: {
    members?: number;
    mediaStorage?: number;
    apiRequests?: number;
    webhookEvents?: number;
    aiCredits?: number;
  }
): {
  isOver: boolean;
  violations: string[];
} {
  const limits = PLAN_LIMITS[plan];
  const violations: string[] = [];

  if (usage.members && usage.members > limits.maxMembers) {
    violations.push(
      `Member count (${usage.members}) exceeds limit (${limits.maxMembers})`
    );
  }

  if (usage.mediaStorage && usage.mediaStorage > limits.maxMediaStorage) {
    violations.push(
      `Media storage (${usage.mediaStorage}MB) exceeds limit (${limits.maxMediaStorage}MB)`
    );
  }

  if (
    usage.apiRequests &&
    limits.maxApiRequests > 0 &&
    usage.apiRequests > limits.maxApiRequests
  ) {
    violations.push(
      `API requests (${usage.apiRequests}) exceed limit (${limits.maxApiRequests})`
    );
  }

  if (usage.webhookEvents && usage.webhookEvents > limits.maxWebhookEvents) {
    violations.push(
      `Webhook events (${usage.webhookEvents}) exceed limit (${limits.maxWebhookEvents})`
    );
  }

  if (
    usage.aiCredits !== undefined &&
    usage.aiCredits > limits.aiCreditsPerMonth
  ) {
    violations.push(
      `AI credits (${usage.aiCredits}) exceed limit (${limits.aiCreditsPerMonth})`
    );
  }

  return {
    isOver: violations.length > 0,
    violations,
  };
}

/**
 * Check if AI features are available for the plan
 */
export function hasAIAccess(plan: PlanType): boolean {
  return PLAN_LIMITS[plan].features.aiAccess;
}

/**
 * Get AI credit limit for a plan
 */
export function getAICreditLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan].aiCreditsPerMonth;
}

/**
 * Get remaining AI credits
 */
export function getRemainingAICredits(
  plan: PlanType,
  usedCredits: number
): number {
  const limit = PLAN_LIMITS[plan].aiCreditsPerMonth;
  return Math.max(0, limit - usedCredits);
}

/**
 * Check if there are enough AI credits available
 */
export function hasEnoughAICredits(
  plan: PlanType,
  usedCredits: number,
  requiredCredits: number
): boolean {
  if (!hasAIAccess(plan)) {
    return false;
  }
  const remaining = getRemainingAICredits(plan, usedCredits);
  return remaining >= requiredCredits;
}

/**
 * Calculate AI credit usage percentage
 */
export function getAICreditUsagePercentage(
  plan: PlanType,
  usedCredits: number
): number {
  const limit = PLAN_LIMITS[plan].aiCreditsPerMonth;
  if (limit === 0) {
    return 0;
  }
  return Math.min(100, (usedCredits / limit) * 100);
}
