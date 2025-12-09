import { toast } from "@astra/ui/components/sonner";
import { creemClient } from "@creem_io/better-auth/client";
import {
  emailOTPClient,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({ schema: inferOrgAdditionalFields<typeof auth>() }),
    emailOTPClient(),
    creemClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

// Type assertion to include Creem methods
export const authClient = client as typeof client & {
  creem: {
    createCheckout: (params: {
      productId: string;
      successUrl?: string;
      metadata?: Record<string, unknown>;
    }) => Promise<{ data?: { url: string }; error?: Error }>;
    createPortal: () => Promise<{ data?: { url: string }; error?: Error }>;
    cancelSubscription: (params?: { id?: string }) => Promise<{
      data?: { success: boolean; message: string };
      error?: Error;
    }>;
    retrieveSubscription: () => Promise<{ data?: unknown; error?: Error }>;
    hasAccessGranted: () => Promise<{
      data?: { hasAccess: boolean; expiresAt?: Date };
      error?: Error;
    }>;
    searchTransactions: (params?: {
      productId?: string;
      pageNumber?: number;
      pageSize?: number;
    }) => Promise<{ data?: { transactions: unknown[] }; error?: Error }>;
  };
};

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
  emailOtp,
} = client;
