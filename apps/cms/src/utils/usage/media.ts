import { db } from "@astra/db";

/**
 * Tracks media upload in the database by creating a usage event.
 */
export async function trackMediaUploadInDB(
  workspaceId: string,
  fileSize: number
): Promise<void> {
  await db.usageEvent.create({
    data: {
      type: "media_upload",
      workspaceId,
      size: fileSize,
    },
  });
}

/**
 * Tracks media upload operations.
 * Each operation is independent and failures don't block others.
 */
export async function trackMediaUpload(
  workspaceId: string,
  fileSize: number,
  _mediaType: string
): Promise<void> {
  try {
    await trackMediaUploadInDB(workspaceId, fileSize);
  } catch (error) {
    console.error("[Media Upload] Failed to track in DB:", error);
  }

  // Note: Creem has built-in event tracking through webhooks
  // No need for separate event ingestion
}
