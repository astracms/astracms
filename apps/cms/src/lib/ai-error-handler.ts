/**
 * AI API Error Handler
 *
 * Provides consistent error handling for AI API calls with user-friendly messages
 */

export type AIErrorType =
  | "account_overdue"
  | "rate_limit"
  | "api_unavailable"
  | "invalid_api_key"
  | "insufficient_credits"
  | "timeout"
  | "unknown";

export interface AIErrorResponse {
  message: string;
  type: AIErrorType;
  userMessage: string;
  canRetry: boolean;
  requiresUpgrade?: boolean;
}

/**
 * Parse and categorize AI API errors
 */
export function parseAIError(error: unknown): AIErrorResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : "Error";

  // Account overdue / payment issues
  if (
    errorMessage.includes("Account overdue") ||
    errorMessage.includes("non-negative balance is required") ||
    errorMessage.includes("payment required")
  ) {
    return {
      message: errorMessage,
      type: "account_overdue",
      userMessage:
        "AI service temporarily unavailable due to provider account issues. Please contact support or try again later.",
      canRetry: false,
      requiresUpgrade: false,
    };
  }

  // Rate limiting
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("429")
  ) {
    return {
      message: errorMessage,
      type: "rate_limit",
      userMessage:
        "AI request limit exceeded. Please wait a moment and try again.",
      canRetry: true,
    };
  }

  // API unavailable / service down
  if (
    errorMessage.includes("503") ||
    errorMessage.includes("service unavailable") ||
    errorMessage.includes("temporarily unavailable") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("ETIMEDOUT")
  ) {
    return {
      message: errorMessage,
      type: "api_unavailable",
      userMessage:
        "AI service is temporarily unavailable. Please try again in a few moments.",
      canRetry: true,
    };
  }

  // Invalid API key
  if (
    errorMessage.includes("invalid") &&
    (errorMessage.includes("api key") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("401") ||
      errorMessage.includes("unauthorized"))
  ) {
    return {
      message: errorMessage,
      type: "invalid_api_key",
      userMessage: "AI service configuration error. Please contact support.",
      canRetry: false,
    };
  }

  // Timeout
  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("timed out") ||
    errorName === "TimeoutError"
  ) {
    return {
      message: errorMessage,
      type: "timeout",
      userMessage: "AI request timed out. Please try again.",
      canRetry: true,
    };
  }

  // Insufficient credits (handled separately but included for completeness)
  if (
    errorMessage.includes("credits") ||
    errorMessage.includes("quota exceeded")
  ) {
    return {
      message: errorMessage,
      type: "insufficient_credits",
      userMessage:
        "You've reached your AI credit limit. Please upgrade your plan to continue.",
      canRetry: false,
      requiresUpgrade: true,
    };
  }

  // Unknown error
  return {
    message: errorMessage,
    type: "unknown",
    userMessage:
      "An unexpected error occurred with the AI service. Please try again.",
    canRetry: true,
  };
}

/**
 * Get a user-friendly error message for AI API errors
 */
export function getAIErrorMessage(error: unknown): string {
  return parseAIError(error).userMessage;
}

/**
 * Check if an AI error can be retried
 */
export function canRetryAIError(error: unknown): boolean {
  return parseAIError(error).canRetry;
}

/**
 * Check if an AI error requires upgrade
 */
export function requiresUpgradeForAI(error: unknown): boolean {
  return parseAIError(error).requiresUpgrade ?? false;
}
