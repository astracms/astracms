import { db } from "@astra/db";
import { PlanType, SubscriptionStatus } from "@astra/db/client";
import { creem } from "@creem_io/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, organization } from "better-auth/plugins";
import {
  sendInviteEmailAction,
  sendResetPasswordAction,
  sendVerificationEmailAction,
  sendWelcomeEmailAction,
} from "@/lib/actions/email";
import { storeUserImageAction } from "@/lib/actions/user";
import { getLastActiveWorkspaceOrNewOneToSetAsActive } from "@/lib/queries/workspace";
import {
  createAuthor,
  validateWorkspaceName,
  validateWorkspaceSchema,
  validateWorkspaceSlug,
  validateWorkspaceTimezone,
} from "../actions/workspace";
import { handleSubscriptionCreated } from "../creem/subscription.created";
import { handleSubscriptionRevoked } from "../creem/subscription.revoked";
import { handleSubscriptionUpdated } from "../creem/subscription.updated";
import { getAICreditLimit } from "../plans";
import { redis } from "../redis";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: async (key) => await redis.get(key),
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  session: {
    storeSessionInDatabase: true,
    preserveSessionInDatabase: true,
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, _request) => {
      await sendResetPasswordAction({
        userEmail: user.email,
        resetLink: url,
      });
    },
    // requireEmailVerification: true,
    // autoSignIn: true
    // ideally that would prevent a session being created on signup
    // problem is after otp verification user has to login again and
    // I don't really like the experience so we'll allow session creation
    // but block unverified users via the middleware
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  organization: {
    modelName: "workspace",
  },
  plugins: [
    creem({
      apiKey: process.env.CREEM_API_KEY as string,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET as string,
      testMode: process.env.NODE_ENV !== "production",
      defaultSuccessUrl: "/success",
      persistSubscriptions: false, // Using custom subscription handling with AI credits

      // Checkout handler for one-time payments
      onCheckoutCompleted: async (data) => {
        const { customer, product } = data;
        console.log(`${customer?.email} purchased ${product.name}`);
      },

      // Subscription webhook handlers - delegate to custom handlers
      onSubscriptionActive: async (data) => {
        await handleSubscriptionCreated(data);
      },

      onSubscriptionPaid: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      onSubscriptionTrialing: async (data) => {
        await handleSubscriptionCreated(data);
      },

      onSubscriptionUpdate: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      onSubscriptionCanceled: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      onSubscriptionExpired: async (data) => {
        await handleSubscriptionRevoked(data);
      },

      onSubscriptionPastDue: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      onSubscriptionPaused: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      onSubscriptionUnpaid: async (data) => {
        await handleSubscriptionUpdated(data);
      },

      // Access control handlers
      onGrantAccess: async ({ reason, customer, product }) => {
        console.log(
          `Granting ${reason} to ${customer.email} for ${product.name}`
        );
      },

      onRevokeAccess: async ({ reason, customer, product }) => {
        console.log(
          `Revoking ${reason} from ${customer.email} for ${product.name}`
        );
      },
    }),
    organization({
      // membershipLimit: 10,
      // check plan limits and set membershipLimit
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
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${data.id}`;
        await sendInviteEmailAction({
          inviteeEmail: data.email,
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          workspaceName: data.organization.name,
          teamLogo: data.organization.logo,
          inviteLink,
        });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization, user }) => {
          // Create author profile
          await createAuthor(user, organization);

          // Create free subscription with AI credits
          const now = new Date();
          const oneYearFromNow = new Date(
            now.getFullYear() + 1,
            now.getMonth(),
            now.getDate()
          );

          await db.subscription.create({
            data: {
              userId: user.id,
              workspaceId: organization.id,
              plan: PlanType.free,
              status: SubscriptionStatus.active,
              creemId: `free_${organization.id}`,
              currentPeriodStart: now,
              currentPeriodEnd: oneYearFromNow,
              aiCreditsUsed: 0,
              aiCreditsLimit: getAICreditLimit("free"),
            },
          });
        },
        afterAcceptInvitation: async ({ user, organization }) => {
          await createAuthor(user, organization);
        },
        beforeCreateOrganization: async ({ organization }) => {
          await validateWorkspaceSchema({
            slug: organization.slug,
            name: organization.name,
            timezone: organization.timezone,
          });
        },
        beforeUpdateOrganization: async ({ organization }) => {
          if (organization.slug) {
            await validateWorkspaceSlug(organization.slug);
          }
          if (organization.name) {
            await validateWorkspaceName(organization.name);
          }
          if (organization.timezone) {
            await validateWorkspaceTimezone(organization.timezone);
          }
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationEmailAction({
          userEmail: email,
          otp,
          type,
        });
      },
    }),
    nextCookies(),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check whether it is a sign-up
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user?.email) {
          try {
            await sendWelcomeEmailAction({
              userEmail: newSession.user.email,
              userName: newSession.user.name,
            });
          } catch (err) {
            console.error("Failed to send welcome email:", err);
          }
        }
      }
    }),
  },
  databaseHooks: {
    // To set active organization when a session is created
    // This works but only when user isnt a new user i.e they already have an organization
    // for new users the middleware redirects them to create a workspace (organization)
    session: {
      create: {
        before: async (session) => {
          try {
            const organization =
              await getLastActiveWorkspaceOrNewOneToSetAsActive(session.userId);
            return {
              data: {
                ...session,
                activeOrganizationId: organization?.id || null,
              },
            };
          } catch (_error) {
            // If there's an error, create the session without an active org
            return { data: session };
          }
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          await storeUserImageAction(user);
        },
      },
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
});
