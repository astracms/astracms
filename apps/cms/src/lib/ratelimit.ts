import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimitHeaders = (
  limit: number,
  remaining: number,
  reset: number
): Headers =>
  new Headers({
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  });

// Create a new ratelimiter, that allows 5 requests per 10 seconds
export const userAvatarUploadRateLimiter = new Ratelimit({
  redis, // Assumes redis is initialized and not null
  limiter: Ratelimit.fixedWindow(5, "10s"),
  analytics: true,
});

// Create a new ratelimiter for AI suggestions, that allows 10 requests per 60 seconds
export const aiSuggestionsRateLimiter = new Ratelimit({
  redis, // Assumes redis is initialized and not null
  limiter: Ratelimit.fixedWindow(10, "60s"),
  analytics: true,
});
