import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "@astra/db";
import { isPast } from "date-fns";
import type { Context, Next } from "hono";
import type { ApiKeyScope } from "../validations/api-key";

const scryptAsync = promisify(scrypt);

/**
 * Verify an API key against a stored hash
 */
async function verifyApiKey(
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
 */
function isValidApiKeyFormat(key: string): boolean {
  if (!key.startsWith("astra_pk_")) {
    return false;
  }

  const keyPart = key.substring(9); // Remove "astra_pk_" prefix
  return /^[0-9A-Za-z]+$/.test(keyPart) && keyPart.length > 0;
}

/**
 * API Key Authentication Middleware for v2 API
 * Validates the API key and attaches workspace context
 */
export const apiKeyAuth = () => async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json(
      {
        error: "Missing Authorization header",
        message: "Please provide an API key in the Authorization header",
      },
      401
    );
  }

  // Extract the API key from "Bearer {key}" format
  const apiKey = authHeader.replace(/^Bearer\s+/i, "");

  if (!apiKey) {
    return c.json(
      {
        error: "Invalid Authorization header",
        message: "Authorization header must be in format: Bearer {api_key}",
      },
      401
    );
  }

  // Validate key format
  if (!isValidApiKeyFormat(apiKey)) {
    return c.json(
      {
        error: "Invalid API key format",
        message:
          "API key must start with 'astra_pk_' and contain only alphanumeric characters",
      },
      401
    );
  }

  // Connect to database
  const db = createClient(c.env.DATABASE_URL);

  try {
    // Find the API key by prefix (first 12 characters)
    const keyPrefix = apiKey.substring(0, 12);

    const apiKeyRecord = await db.apiKey.findFirst({
      where: {
        keyPrefix,
      },
      select: {
        id: true,
        key: true,
        enabled: true,
        expiresAt: true,
        workspaceId: true,
        scopes: true,
      },
    });

    if (!apiKeyRecord) {
      return c.json(
        {
          error: "Invalid API key",
          message: "The provided API key does not exist",
        },
        401
      );
    }

    // Verify the full key hash
    const isValid = await verifyApiKey(apiKeyRecord.key, apiKey);

    if (!isValid) {
      return c.json(
        {
          error: "Invalid API key",
          message: "The provided API key is incorrect",
        },
        401
      );
    }

    // Check if key is enabled
    if (!apiKeyRecord.enabled) {
      return c.json(
        {
          error: "API key disabled",
          message: "This API key has been disabled",
        },
        403
      );
    }

    // Check if key has expired
    if (apiKeyRecord.expiresAt && isPast(new Date(apiKeyRecord.expiresAt))) {
      return c.json(
        {
          error: "API key expired",
          message: "This API key has expired",
        },
        403
      );
    }

    // Attach workspace and API key info to context for use in routes
    c.set("workspaceId", apiKeyRecord.workspaceId);
    c.set("apiKeyId", apiKeyRecord.id);
    c.set("apiKeyScopes", apiKeyRecord.scopes);

    // Update last used timestamp (async, don't wait)
    c.executionCtx?.waitUntil(
      db.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      })
    );

    await next();
  } catch (error) {
    console.error("API key authentication error:", error);
    return c.json(
      {
        error: "Authentication failed",
        message: "An error occurred while validating your API key",
      },
      500
    );
  }
};

/**
 * Scope validation middleware
 * Use after apiKeyAuth to check if the API key has the required scope
 */
export const requireScope =
  (requiredScope: ApiKeyScope) => async (c: Context, next: Next) => {
    const scopes = c.get("apiKeyScopes") as string[] | undefined;

    if (!scopes) {
      return c.json(
        {
          error: "Unauthorized",
          message: "No API key authentication found",
        },
        401
      );
    }

    const hasScope = scopes.includes(requiredScope);

    // Check for write scope (write permission implies read permission)
    const [resource] = requiredScope.split(":");
    const hasWriteScope = scopes.includes(`${resource}:write`);

    if (!hasScope && !hasWriteScope) {
      return c.json(
        {
          error: "Insufficient permissions",
          message: `This API key does not have the required '${requiredScope}' permission`,
        },
        403
      );
    }

    await next();
  };
