"use server";

import { db } from "@astra/db";
import { SubscriptionStatus } from "@astra/db/client";
import type { FlatSubscriptionEvent } from "@creem_io/better-auth";

/**
 * Handle subscription revoked/expired events.
 * The payload is flattened - subscription properties are at the root level.
 */
export async function handleSubscriptionRevoked(
  payload: FlatSubscriptionEvent<string>
) {
  // FlatSubscriptionEvent is flattened: subscription props are at root level
  const { id: subscriptionId } = payload;

  const existingSubscription = await db.subscription.findUnique({
    where: { creemId: subscriptionId },
  });

  if (!existingSubscription) {
    console.error(
      `subscription.revoked webhook received for a subscription that does not exist: ${subscriptionId}`
    );
    return;
  }

  try {
    await db.subscription.update({
      where: { creemId: subscriptionId },
      data: {
        status: SubscriptionStatus.expired,
        endedAt: new Date(),
      },
    });

    console.log(
      `Successfully marked subscription ${subscriptionId} as revoked/expired for workspace ${existingSubscription.workspaceId}`
    );
  } catch (error) {
    console.error("Error updating subscription to revoked in DB:", error);
  }
}
