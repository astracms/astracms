import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

const MINIO_ENDPOINT = env.MINIO_ENDPOINT;
const MINIO_ACCESS_KEY = env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = env.MINIO_SECRET_KEY;
const MINIO_BUCKET_NAME = env.MINIO_BUCKET_NAME || "astracms-media";
const MINIO_PUBLIC_URL = env.MINIO_PUBLIC_URL;

// Check if Minio is configured
const isMinioConfigured =
  !!MINIO_ENDPOINT &&
  !!MINIO_ACCESS_KEY &&
  !!MINIO_SECRET_KEY &&
  !!MINIO_PUBLIC_URL;

// Create S3 client only if Minio is configured
export const s3 = isMinioConfigured
  ? new S3Client({
      region: "us-east-1", // Minio typically uses a default region
      endpoint: MINIO_ENDPOINT,
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Required for Minio
    })
  : null;

export const S3_BUCKET_NAME = MINIO_BUCKET_NAME;
export const S3_PUBLIC_URL = MINIO_PUBLIC_URL || "";

// Helper to check if S3 is available
export function isS3Available(): boolean {
  return isMinioConfigured && s3 !== null;
}

// Helper to get S3 client with error handling
export function getS3Client(): S3Client {
  if (!s3) {
    throw new Error(
      "Minio S3 is not configured. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_PUBLIC_URL environment variables."
    );
  }
  return s3;
}
