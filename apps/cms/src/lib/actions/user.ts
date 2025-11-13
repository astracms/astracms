"use server";

import { db } from "@astracms/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { User } from "better-auth";
import { nanoid } from "nanoid";
import { isAllowedAvatarUrl } from "@/lib/constants";
import {
  getS3Client,
  isS3Available,
  S3_BUCKET_NAME,
  S3_PUBLIC_URL,
} from "@/lib/s3";

export async function storeUserImageAction(user: User) {
  if (!user.image) {
    return;
  }

  // Check if S3 is available
  if (!isS3Available()) {
    console.warn("S3 storage not configured, skipping user image storage");
    return;
  }

  try {
    const s3Client = getS3Client();
    // Validate the URL is from an allowed provider with HTTPS
    if (!isAllowedAvatarUrl(user.image)) {
      console.warn(`Avatar URL not from allowed host: ${user.image}`);
      return;
    }
    const response = await fetch(user.image);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Grab file type from headers
    const contentType = response.headers.get("content-type") || "image/png";

    // Convert to Buffer for upload
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = contentType.split("/")[1];
    const key = `avatars/${nanoid()}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      })
    );

    const publicUrl = `${S3_PUBLIC_URL}/${key}`;

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: publicUrl,
      },
    });

    return { avatarUrl: publicUrl };
  } catch (error) {
    console.error("Failed to store user avatar:", error);
  }
}
