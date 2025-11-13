import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database
    DATABASE_URL: z
      .string()
      .url()
      .describe("PostgreSQL connection string"),

    // Authentication
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .describe("Secret key for Better Auth (min 32 chars)"),
    BETTER_AUTH_URL: z
      .string()
      .url()
      .describe("Base URL for Better Auth"),

    // Redis (Upstash)
    REDIS_URL: z
      .string()
      .url()
      .optional()
      .describe("Upstash Redis URL"),
    REDIS_TOKEN: z
      .string()
      .optional()
      .describe("Upstash Redis token"),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z
      .string()
      .optional()
      .describe("Google OAuth client ID"),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .optional()
      .describe("Google OAuth client secret"),
    GITHUB_ID: z
      .string()
      .optional()
      .describe("GitHub OAuth client ID"),
    GITHUB_SECRET: z
      .string()
      .optional()
      .describe("GitHub OAuth client secret"),

    // Email Service (Resend)
    RESEND_API_KEY: z
      .string()
      .optional()
      .describe("Resend API key for transactional emails"),

    // QStash (Webhook queue)
    QSTASH_TOKEN: z
      .string()
      .optional()
      .describe("QStash token for webhook delivery"),

    // S3-compatible storage (Minio/R2)
    MINIO_ENDPOINT: z
      .string()
      .optional()
      .describe("Minio/S3 endpoint URL"),
    MINIO_ACCESS_KEY: z
      .string()
      .optional()
      .describe("Minio/S3 access key"),
    MINIO_SECRET_KEY: z
      .string()
      .optional()
      .describe("Minio/S3 secret key"),
    MINIO_BUCKET_NAME: z
      .string()
      .optional()
      .describe("Minio/S3 bucket name"),
    MINIO_PUBLIC_URL: z
      .string()
      .optional()
      .describe("Public URL for media files"),

    // Polar (Billing)
    POLAR_ACCESS_TOKEN: z
      .string()
      .optional()
      .describe("Polar API access token"),
    POLAR_WEBHOOK_SECRET: z
      .string()
      .optional()
      .describe("Polar webhook secret for signature verification"),
    POLAR_SUCCESS_URL: z
      .string()
      .optional()
      .describe("Polar checkout success redirect URL"),
    POLAR_HOBBY_PRODUCT_ID: z
      .string()
      .optional()
      .describe("Polar product ID for hobby plan"),
    POLAR_PRO_PRODUCT_ID: z
      .string()
      .optional()
      .describe("Polar product ID for pro plan"),
    POLAR_TEAM_PRODUCT_ID: z
      .string()
      .optional()
      .describe("Polar product ID for team plan"),

    // AI Gateway
    AI_GATEWAY_API_KEY: z
      .string()
      .optional()
      .describe("API key for AI gateway"),

    // Node environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  /**
   * Client-side environment variables schema
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .describe("Public URL of the application"),
  },

  /**
   * Runtime environment variables (auto-populated from process.env)
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME,
    MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
    POLAR_HOBBY_PRODUCT_ID: process.env.POLAR_HOBBY_PRODUCT_ID,
    POLAR_PRO_PRODUCT_ID: process.env.POLAR_PRO_PRODUCT_ID,
    POLAR_TEAM_PRODUCT_ID: process.env.POLAR_TEAM_PRODUCT_ID,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Skip validation during build (for Docker builds without full env)
   * Set to true if you need to build without all env vars present
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes TypeScript errors on invalid env vars more readable
   */
  emptyStringAsUndefined: true,
});
