import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { rateLimitHeaders, userAvatarUploadRateLimiter } from "@/lib/ratelimit";
import { getS3Client, isS3Available, S3_BUCKET_NAME } from "@/lib/s3";
import { uploadSchema, validateUpload } from "@/lib/validations/upload";

export async function POST(request: Request) {
  const sessionData = await getServerSession();

  if (!sessionData || !sessionData.session.activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if S3 is available
  if (!isS3Available()) {
    return NextResponse.json(
      { error: "Storage service not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const parsedBody = uploadSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { type, fileType, fileSize } = parsedBody.data;

  if (type === "avatar") {
    const { success, limit, remaining, reset } =
      await userAvatarUploadRateLimiter.limit(sessionData.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Too Many Requests", remaining },
        { status: 429, headers: rateLimitHeaders(limit, remaining, reset) }
      );
    }
  }

  try {
    validateUpload({ type, fileType, fileSize });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid file type";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const id = nanoid();
  const extension = fileType.split("/")[1];
  let key: string;

  switch (type) {
    case "avatar":
      key = `avatars/${id}.${extension}`;
      break;
    case "author-avatar":
      key = `avatars/${id}.${extension}`;
      break;
    case "logo":
      key = `logos/${id}.${extension}`;
      break;
    case "media":
      key = `media/${id}.${extension}`;
      break;
    default:
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 }
      );
  }

  const s3Client = getS3Client();
  const presignedUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    }),
    { expiresIn: 3600 }
  );

  return NextResponse.json({ url: presignedUrl, key });
}
