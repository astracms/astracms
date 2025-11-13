import { Redis } from "@upstash/redis";
import type { Context, MiddlewareHandler, Next } from "hono";

// Singleton Redis client
let redisClient: Redis | null = null;

function getRedisClient(redisUrl?: string, redisToken?: string): Redis | null {
  if (redisClient) return redisClient;

  if (!redisUrl || !redisToken) {
    console.error("[Analytics Redis] Missing REDIS_URL or REDIS_TOKEN");
    return null;
  }

  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    return redisClient;
  } catch (error) {
    console.error("[Analytics Redis] Failed to initialize:", error);
    return null;
  }
}

export const analytics = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    // Proceed to the next middleware or route handler first
    // to avoid delaying the response
    await next();

    const env = c.get("env") as any;
    const REDIS_URL = env?.REDIS_URL || process.env.REDIS_URL;
    const REDIS_TOKEN = env?.REDIS_TOKEN || process.env.REDIS_TOKEN;

    if (!REDIS_URL || !REDIS_TOKEN) {
      return;
    }

    const redis = getRedisClient(REDIS_URL, REDIS_TOKEN);
    if (!redis) {
      return;
    }

    const workspaceId: string | null = c.req.param("workspaceId") ?? null;
    const monthlyKey = new Date().toISOString().slice(0, 7);

    const method = c.req.method;
    const status = c.res.status ?? 200;
    if (!workspaceId || method === "OPTIONS" || status >= 400) {
      return;
    }

    const task = async () => {
      try {
        const pipeline = redis.pipeline();
        pipeline.hincrby(`analytics:workspace:${workspaceId}`, "pageViews", 1);
        pipeline.hincrby(
          `analytics:workspace:${workspaceId}:monthly`,
          monthlyKey,
          1,
        );
        await pipeline.exec();
      } catch (error) {
        console.error("[Analytics] Error tracking analytics:", error);
      }
    };

    // In Node.js, execute the task asynchronously without blocking
    task().catch((err) => {
      console.error("[Analytics] Task error:", err);
    });
  };
};
