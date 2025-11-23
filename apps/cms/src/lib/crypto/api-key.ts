import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const API_KEY_PREFIX = "astra_pk_";
const KEY_LENGTH = 32; // 32 bytes = 256 bits
const SALT_LENGTH = 16;
const KEY_DISPLAY_PREFIX_LENGTH = 12; // Show first 12 chars of the key

/**
 * Base62 character set for encoding (alphanumeric, case-sensitive)
 */
const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * Convert bytes to base62 string
 */
function toBase62(bytes: Buffer): string {
  let result = "";
  let num = BigInt(`0x${bytes.toString("hex")}`);

  while (num > 0n) {
    const remainder = Number(num % 62n);
    result = BASE62_CHARS[remainder] + result;
    num /= 62n;
  }

  return result || "0";
}

/**
 * Generate a new API key
 * Format: astra_pk_{base62_encoded_random}
 * @returns Object containing the plain key and the prefix for display
 */
export function generateApiKey(): {
  key: string;
  keyPrefix: string;
} {
  const randomPart = randomBytes(KEY_LENGTH);
  const base62Key = toBase62(randomPart);
  const key = `${API_KEY_PREFIX}${base62Key}`;
  const keyPrefix = key.substring(0, KEY_DISPLAY_PREFIX_LENGTH);

  return {
    key,
    keyPrefix,
  };
}

/**
 * Hash an API key using scrypt
 * @param key - The plain text API key
 * @returns The hashed key in the format: {salt}:{hash}
 */
export async function hashApiKey(key: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = (await scryptAsync(key, salt, 64)) as Buffer;

  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify an API key against a stored hash
 * @param storedHash - The stored hash in format {salt}:{hash}
 * @param providedKey - The plain text key to verify
 * @returns true if the key matches the hash
 */
export async function verifyApiKey(
  storedHash: string,
  providedKey: string
): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const storedHashBuffer = Buffer.from(hashHex, "hex");

    const providedHashBuffer = (await scryptAsync(
      providedKey,
      salt,
      64
    )) as Buffer;

    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(storedHashBuffer, providedHashBuffer);
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

/**
 * Validate API key format
 * @param key - The key to validate
 * @returns true if the key has the correct format
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  const keyPart = key.substring(API_KEY_PREFIX.length);
  // Check if the key part contains only base62 characters
  return /^[0-9A-Za-z]+$/.test(keyPart) && keyPart.length > 0;
}

/**
 * Extract the prefix from a full API key for display purposes
 * @param key - The full API key
 * @returns The prefix (first 12 characters)
 */
export function getApiKeyPrefix(key: string): string {
  return key.substring(0, KEY_DISPLAY_PREFIX_LENGTH);
}

/**
 * Mask an API key for display (show only prefix + asterisks)
 * @param keyPrefix - The key prefix to display
 * @returns Masked key string like "astra_pk_abc***"
 */
export function maskApiKey(keyPrefix: string): string {
  return `${keyPrefix}${"*".repeat(32)}`;
}
