/**
 * Client-safe API key utilities
 * These functions don't use Node.js APIs and can be used in browser code
 */

const API_KEY_PREFIX = "astra_pk_";
const KEY_DISPLAY_PREFIX_LENGTH = 12;

/**
 * Validate API key format (client-safe)
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
