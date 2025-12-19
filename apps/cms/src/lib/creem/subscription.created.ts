"use server";

import { db } from "@astra/db";
import { PlanType, SubscriptionStatus } from "@astra/db/client";
import type { FlatSubscriptionEvent } from "@creem_io/better-auth";
import { sendSubscriptionCreatedEmailAction } from "@/lib/actions/email";
import { getAICreditLimit } from "@/lib/plans";

function getPlanType(productName: string): PlanType | null {
  const plan = productName.toLowerCase();
  if (plan === "pro") {
    return PlanType.pro;
  }
  if (plan === "team") {
    return PlanType.team;
  }
  if (plan === "premium" || plan === "enterprise") {
    return PlanType.premium;
  }
  return null;
}

function getSubscriptionStatus(creemStatus: string): SubscriptionStatus | null {
  switch (creemStatus) {
    case "active":
      return SubscriptionStatus.active;
    case "trialing":
      return SubscriptionStatus.trialing;
    case "canceled":
      return SubscriptionStatus.cancelled;
    case "past_due":
    case "incomplete":
      return SubscriptionStatus.past_due;
    case "unpaid":
      return SubscriptionStatus.unpaid;
    case "incomplete_expired":
    case "expired":
      return SubscriptionStatus.expired;
    case "paused":
      return SubscriptionStatus.paused;
    default:
      return null;
  }
}

/**
 * Handle subscription created/active/trialing events.
 * The payload is flattened - subscription properties are at the root level.
 */
export async function handleSubscriptionCreated(
  payload: FlatSubscriptionEvent<string>
) {
  // FlatSubscriptionEvent is flattened: subscription props are at root level
  const {
    id: subscriptionId,
    product,
    customer,
    metadata,
    status: creemStatus,
    current_period_start_date,
    current_period_end_date,
  } = payload;

  // workspaceId is passed from our client, referenceId is auto-set by Creem to the user ID
  const workspaceId = metadata?.workspaceId as string | undefined;
  // Creem auto-sets referenceId to the authenticated user's ID
  const metadataUserId =
    typeof metadata?.referenceId === "string" ? metadata.referenceId : null;

  if (typeof workspaceId !== "string") {
    console.error(
      "subscription.created webhook received without a string workspaceId in metadata.referenceId"
    );
    return;
  }

  // Look up user - first try by metadata userId, then by email
  let userExists = metadataUserId
    ? await db.user.findUnique({ where: { id: metadataUserId } })
    : null;

  // If not found by ID, try by email
  if (!userExists && customer.email) {
    userExists = await db.user.findUnique({ where: { email: customer.email } });
  }

  if (!userExists) {
    console.error(
      `User not found by id ${metadataUserId} or email ${customer.email}`
    );
    return;
  }

  const userId = userExists.id;

  const workspaceExists = await db.organization.findUnique({
    where: { id: workspaceId },
  });
  if (!workspaceExists) {
    console.error(`Workspace with id ${workspaceId} not found.`);
    return;
  }

  const plan = getPlanType(product.name);
  if (!plan) {
    console.error(`Unknown plan: ${product.name}`);
    return;
  }

  const status = getSubscriptionStatus(creemStatus);
  if (!status) {
    console.error(`Unknown subscription status from Creem: ${creemStatus}`);
    return;
  }

  if (!current_period_start_date) {
    console.error(
      "subscription.created webhook received without a current_period_start_date"
    );
    return;
  }

  if (!current_period_end_date) {
    console.error(
      "subscription.created webhook received without a current_period_end_date"
    );
    return;
  }

  try {
    const aiCreditsLimit = getAICreditLimit(plan);

    // Check if subscription already exists (upsert)
    const existingSubscription = await db.subscription.findUnique({
      where: { creemId: subscriptionId },
    });

    if (existingSubscription) {
      await db.subscription.update({
        where: { creemId: subscriptionId },
        data: {
          plan,
          status,
          currentPeriodStart: new Date(current_period_start_date),
          currentPeriodEnd: new Date(current_period_end_date),
          aiCreditsLimit,
        },
      });
      console.log(
        `Successfully updated subscription for workspace ${workspaceId}`
      );
    } else {
      await db.subscription.create({
        data: {
          creemId: subscriptionId,
          plan,
          status,
          currentPeriodStart: new Date(current_period_start_date),
          currentPeriodEnd: new Date(current_period_end_date),
          userId,
          workspaceId,
          aiCreditsLimit,
          aiCreditsUsed: 0,
        },
      });
      console.log(
        `Successfully created subscription for workspace ${workspaceId} with ${aiCreditsLimit} AI credits`
      );

      // Send subscription created email
      const periodStartDate = new Date(current_period_start_date);
      const periodEndDate = new Date(current_period_end_date);
      await sendSubscriptionCreatedEmailAction({
        userEmail: customer.email,
        planName: product.name,
        workspaceName: workspaceExists.name,
        periodStart: periodStartDate.toLocaleDateString(),
        periodEnd: periodEndDate.toLocaleDateString(),
      });
    }
  } catch (error) {
    console.error("Error creating/updating subscription in DB:", error);
  }
}
