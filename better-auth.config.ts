import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, organization } from "better-auth/plugins";

/**
 * Minimal Better Auth configuration for CLI operations in monorepo
 *
 * IMPORTANT: This file is NOT required for runtime. The Prisma schema at
 * packages/db/prisma/schema.prisma already contains all Better Auth models
 * (User, Session, Account, Verification, Member, Invitation).
 *
 * This file exists to provide a working Better Auth CLI configuration that
 * can be used in a monorepo context without module resolution issues.
 *
 * Usage:
 * - To generate schema: pnpx @better-auth/cli generate --config better-auth.config.ts
 * - To migrate: Use Prisma directly (pnpm db:migrate)
 *
 * Runtime Configuration:
 * The actual auth configuration used by the application is at:
 * apps/cms/src/lib/auth/auth.ts
 *
 * That file contains:
 * - Full runtime configuration with all hooks and plugins
 * - Email handlers (Resend integration)
 * - Polar billing integration
 * - Workspace (organization) hooks
 * - Session management with Redis
 *
 * Note: This uses a standard PrismaClient (not the Neon adapter) because
 * the Better Auth CLI runs in an isolated environment via pnpx and can't
 * access workspace dependencies like @neondatabase/serverless.
 */

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  organization: {
    modelName: "workspace",
  },
  plugins: [
    organization({
      schema: {
        organization: {
          additionalFields: {
            timezone: {
              type: "string",
              input: true,
              required: false,
            },
          },
        },
      },
      async sendInvitationEmail() {
        // No-op for CLI - actual implementation in apps/cms/src/lib/auth/auth.ts
      },
    }),
    emailOTP({
      async sendVerificationOTP() {
        // No-op for CLI - actual implementation in apps/cms/src/lib/auth/auth.ts
      },
    }),
  ],
});
