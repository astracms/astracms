import { Redis } from "@upstash/redis";
import type { Context, MiddlewareHandler, Next } from "hono";
import { env } from "hono/adapter";

export type RateLimit = {
  limit: number;
  remaining: number;
  reset: number;
  success: boolean;
};

// Singleton Redis client
let redisClient: Redis | null = null;

function getRedisClient(redisUrl?: string, redisToken?: string): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  if (!redisUrl || !redisToken) {
    console.error("[RateLimit Redis] Missing REDIS_URL or REDIS_TOKEN");
    return null;
  }

  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    return redisClient;
  } catch (error) {
    console.error("[RateLimit Redis] Failed to initialize:", error);
    return null;
  }
}

/**
 * Sliding window rate limiter implementation using Redis
 * Uses sorted sets to track requests within a time window
 */
async function slidingWindowRateLimit(
  redis: Redis,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimit> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  try {
    // Start a pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current requests in window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}` });

    // Set expiry on the key
    pipeline.expire(key, windowSeconds * 2);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Pipeline execution failed");
    }

    // Extract count from results (index 1 is zcard result)
    const count = (results[1] as number) || 0;

    const remaining = Math.max(0, limit - count - 1);
    const success = count < limit;
    const reset = Math.ceil((now + windowSeconds * 1000) / 1000);

    return {
      limit,
      remaining,
      reset,
      success,
    };
  } catch (error) {
    console.error("[RateLimit] Error applying rate limit:", error);
    // On error, allow the request
    return {
      limit,
      remaining: limit,
      reset: Math.ceil((now + windowSeconds * 1000) / 1000),
      success: true,
    };
  }
}

// In-memory cache for when Redis is not available
const memoryCache = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): RateLimit {
  const now = Date.now();
  const cached = memoryCache.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of memoryCache.entries()) {
      if (value.resetAt < now) {
        memoryCache.delete(key);
      }
    }
  }

  if (!cached || cached.resetAt < now) {
    // New window
    const resetAt = now + windowSeconds * 1000;
    memoryCache.set(identifier, { count: 1, resetAt });
    return {
      limit,
      remaining: limit - 1,
      reset: Math.ceil(resetAt / 1000),
      success: true,
    };
  }

  // Within existing windos
  cached.count += 1;
  const success = cached.count <= limit;
  const remaining = Math.max(0, limit - cached.count);

  return {
    limit,
    remaining: Math.max(0, limit - cached.count),
    reset: Math.ceil(cached.resetAt / 1000),
    success,
  };
}

// Create a middleware function that can be used with Hono
export const ratelimit = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    try {
      const { REDIS_URL, REDIS_TOKEN } = env<{
        REDIS_URL: string;
        REDIS_TOKEN: string;
      }>(c);

      // Get client IP or a unique identifier
      const clientIp =
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-real-ip") ||
        "anonymous";

      // Check if there's a workspaceId in the URL path
      const workspaceId: string | null = c.req.param("workspaceId") ?? null;

      // Create a composite identifier that includes both IP and workspaceId if available
      const identifier = workspaceId
        ? `${clientIp}:workspace:${workspaceId}`
        : clientIp;

      // Apply different rate limits based on whether a workspaceId is present
      // With workspace: 200 requests per 10 seconds
      // Without workspace: 10 requests per 10 seconds
      const limit = workspaceId ? 200 : 10;
      const windowSeconds = 10;

      let result: RateLimit;

      const redis = getRedisClient(REDIS_URL, REDIS_TOKEN);
      if (redis) {
        // Use Redis-based rate limiting
        result = await slidingWindowRateLimit(
          redis,
          identifier,
          limit,
          windowSeconds
        );
      } else {
        // Fallback to memory-based rate limiting
        console.warn("[RateLimit] Redis not available, using memory cache");
        result = memoryRateLimit(identifier, limit, windowSeconds);
      }

      // Add rate limit info to response headers
      c.header("X-RateLimit-Limit", String(result.limit));
      c.header("X-RateLimit-Remaining", String(result.remaining));
      c.header("X-RateLimit-Reset", String(result.reset));

      // If rate limit exceeded, return 429 Too Many Requests
      if (!result.success) {
        return c.json(
          {
            error: "Too many requests",
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
          },
          429
        );
      }

      // Continue to the next middleware or route handler
      return await next();
    } catch (error) {
      console.error("[RateLimit] Unexpected error:", error);
      // Continue even if rate limiting fails
      return await next();
    }
  };
};
