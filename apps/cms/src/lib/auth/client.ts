import { toast } from "@astracms/ui/components/sonner";
import { polarClient } from "@polar-sh/better-auth";
import {
  emailOTPClient,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    organizationClient({ schema: inferOrgAdditionalFields<typeof auth>() }),
    emailOTPClient(),
    polarClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
  emailOtp,
  checkout,
} = authClient;
