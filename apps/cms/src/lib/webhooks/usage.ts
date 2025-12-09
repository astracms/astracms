import { db } from "@astra/db";

type TrackWebhookUsageArgs = {
  workspaceId: string | null | undefined;
  endpoint: string;
  event: string;
  webhookId: string;
  format: string;
  status?: "success" | "failure";
};

export async function trackWebhookUsage({
  workspaceId,
  endpoint,
}: TrackWebhookUsageArgs) {
  if (!workspaceId) {
    return;
  }

  try {
    await db.usageEvent.create({
      data: {
        type: "webhook_delivery",
        workspaceId,
        endpoint,
      },
    });
  } catch (error) {
    console.error("[WebhookUsage] Failed to store usage event:", error);
  }
}
