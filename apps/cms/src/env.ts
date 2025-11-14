import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_ID: z.string().optional(), // Commented out in .env
    GITHUB_SECRET: z.string().optional(), // Commented out in .env
    RESEND_API_KEY: z.string().min(1),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().optional(), // Empty in .env
    POLAR_SUCCESS_URL: z.string().url(),
    POLAR_HOBBY_PRODUCT_ID: z.string().optional(), // Empty in .env
    POLAR_PRO_PRODUCT_ID: z.string().optional(), // Empty in .env
    POLAR_TEAM_PRODUCT_ID: z.string().optional(), // Empty in .env
    MINIO_ENDPOINT: z.string().url(),
    MINIO_ACCESS_KEY: z.string().min(1),
    MINIO_SECRET_KEY: z.string().min(1),
    MINIO_BUCKET_NAME: z.string().min(1),
    MINIO_PUBLIC_URL: z.string().url(),
    QSTASH_TOKEN: z.string().min(1),
    REDIS_URL: z.string().url(),
    REDIS_TOKEN: z.string().min(1),
    AI_GATEWAY_API_KEY: z.string().optional(), // Empty in .env
    OPEN_AI_API_KEY: z.string().min(1).optional(),
    NODE_ENV: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID:
      process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
  },
});
