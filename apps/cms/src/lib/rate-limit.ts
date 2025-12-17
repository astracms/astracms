/**
 * Rate limiting using Upstash
 * Prevents API abuse and protects against DDoS attacks
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { getEnv } from "./env";

// Initialize Redis client
const env = getEnv();
const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

/**
 * Rate limiter for AI chat endpoints
 * 10 requests per minute per workspace
 */
export const aiChatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai-chat",
});

/**
 * Rate limiter for AI tool execution
 * 20 requests per minute per workspace
 */
export const aiToolRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai-tool",
});

/**
 * Rate limiter for general API endpoints
 * 60 requests per minute per user
 */
export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
});

/**
 * Check rate limit and return error response if exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again later.",
        limit,
        reset: new Date(reset).toISOString(),
        remaining,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
