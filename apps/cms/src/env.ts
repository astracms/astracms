import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and are never exposed to the client
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Authentication (Better Auth)
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),

    // Email (Resend)
    RESEND_API_KEY: z.string().optional(),

    // Billing (Polar)
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    POLAR_SUCCESS_URL: z.string().url().optional(),
    POLAR_HOBBY_PRODUCT_ID: z.string().optional(),
    POLAR_PRO_PRODUCT_ID: z.string().optional(),
    POLAR_TEAM_PRODUCT_ID: z.string().optional(),

    // Storage (Minio/S3)
    MINIO_ENDPOINT: z.string().optional(),
    MINIO_ACCESS_KEY: z.string().optional(),
    MINIO_SECRET_KEY: z.string().optional(),
    MINIO_BUCKET_NAME: z.string().optional(),
    MINIO_PUBLIC_URL: z.string().optional(),

    // Queue (QStash)
    QSTASH_TOKEN: z.string().optional(),

    // Cache (Redis)
    REDIS_URL: z.string().url().optional(),
    REDIS_TOKEN: z.string().optional(),

    // AI
    AI_GATEWAY_API_KEY: z.string().optional(),

    // Node Environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * You need to manually destructure all NEXT_PUBLIC_ variables here
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
  },

  /**
   * Skip validation during build time for Docker builds
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
