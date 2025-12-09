"use server";

import { db } from "@astra/db";
import { PlanType, SubscriptionStatus } from "@astra/db/client";
import type { FlatSubscriptionEvent } from "@creem_io/better-auth";
import {
  sendSubscriptionCanceledEmailAction,
  sendSubscriptionRenewedEmailAction,
} from "@/lib/actions/email";
import { getAICreditLimit } from "@/lib/plans";

function getPlanType(productName: string): PlanType | null {
  const plan = productName.toLowerCase();
  if (plan === "pro") {
    return PlanType.pro;
  }
  if (plan === "team") {
    return PlanType.team;
  }
  if (plan === "enterprise") {
    return PlanType.enterprise;
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
 * Handle subscription update/paid/canceled/past_due/paused events.
 * The payload is flattened - subscription properties are at the root level.
 */
export async function handleSubscriptionUpdated(
  payload: FlatSubscriptionEvent<string>
) {
  // FlatSubscriptionEvent is flattened: subscription props are at root level
  const {
    id: subscriptionId,
    product,
    customer,
    status: creemStatus,
    current_period_start_date,
    current_period_end_date,
    canceled_at,
  } = payload;

  const existingSubscription = await db.subscription.findUnique({
    where: { creemId: subscriptionId },
  });

  if (!existingSubscription) {
    console.error(
      `subscription.updated webhook received for a subscription that does not exist: ${subscriptionId}`
    );
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

  if (!current_period_start_date || !current_period_end_date) {
    console.error(
      "subscription.updated webhook received without current_period_start_date or current_period_end_date"
    );
    return;
  }

  try {
    const newPeriodStart = new Date(current_period_start_date);
    const oldPeriodStart = existingSubscription.currentPeriodStart;

    // Check if billing period has changed (new cycle)
    const billingPeriodChanged =
      newPeriodStart.getTime() !== oldPeriodStart.getTime();

    // Get AI credit limit for the plan
    const aiCreditsLimit = getAICreditLimit(plan);

    // If billing period changed OR plan changed, reset credits
    const shouldResetCredits =
      billingPeriodChanged || existingSubscription.plan !== plan;

    await db.subscription.update({
      where: { creemId: subscriptionId },
      data: {
        plan,
        status,
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: new Date(current_period_end_date),
        cancelAtPeriodEnd: status === "cancelled",
        canceledAt: canceled_at ? new Date(canceled_at) : null,
        aiCreditsLimit,
        // Reset credits if billing period changed or plan changed
        aiCreditsUsed: shouldResetCredits
          ? 0
          : existingSubscription.aiCreditsUsed,
      },
    });

    console.log(
      `Successfully updated subscription ${subscriptionId} for workspace ${existingSubscription.workspaceId}${shouldResetCredits ? " (AI credits reset)" : ""}`
    );

    // Get workspace name for email
    const workspace = await db.organization.findUnique({
      where: { id: existingSubscription.workspaceId },
    });
    const workspaceName = workspace?.name || "Your Workspace";

    // Send renewal email if billing period changed (and status is still active)
    if (billingPeriodChanged && status === SubscriptionStatus.active) {
      await sendSubscriptionRenewedEmailAction({
        userEmail: customer.email,
        planName: product.name,
        workspaceName,
        periodStart: newPeriodStart.toLocaleDateString(),
        periodEnd: new Date(current_period_end_date).toLocaleDateString(),
      });
    }

    // Send cancellation email if status changed to cancelled
    if (
      status === SubscriptionStatus.cancelled &&
      existingSubscription.status !== SubscriptionStatus.cancelled
    ) {
      await sendSubscriptionCanceledEmailAction({
        userEmail: customer.email,
        planName: product.name,
        workspaceName,
        accessEndDate: new Date(current_period_end_date).toLocaleDateString(),
      });
    }
  } catch (error) {
    console.error("Error updating subscription in DB:", error);
  }
}
