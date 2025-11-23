import { z } from "zod";

export const apiKeyScopeEnum = z.enum([
  "posts:read",
  "posts:write",
  "categories:read",
  "categories:write",
  "tags:read",
  "tags:write",
  "authors:read",
  "authors:write",
  "media:read",
  "media:write",
]);

export type ApiKeyScope = z.infer<typeof apiKeyScopeEnum>;

export const apiKeyScopes: Array<{
  id: ApiKeyScope;
  label: string;
  description: string;
  category: "read" | "write";
}> = [
  {
    id: "posts:read",
    label: "Read Posts",
    description: "Read posts from your workspace",
    category: "read",
  },
  {
    id: "posts:write",
    label: "Write Posts",
    description: "Create, update, and delete posts",
    category: "write",
  },
  {
    id: "categories:read",
    label: "Read Categories",
    description: "Read categories from your workspace",
    category: "read",
  },
  {
    id: "categories:write",
    label: "Write Categories",
    description: "Create, update, and delete categories",
    category: "write",
  },
  {
    id: "tags:read",
    label: "Read Tags",
    description: "Read tags from your workspace",
    category: "read",
  },
  {
    id: "tags:write",
    label: "Write Tags",
    description: "Create, update, and delete tags",
    category: "write",
  },
  {
    id: "authors:read",
    label: "Read Authors",
    description: "Read authors from your workspace",
    category: "read",
  },
  {
    id: "authors:write",
    label: "Write Authors",
    description: "Create, update, and delete authors",
    category: "write",
  },
  {
    id: "media:read",
    label: "Read Media",
    description: "Read media from your workspace",
    category: "read",
  },
  {
    id: "media:write",
    label: "Write Media",
    description: "Upload and delete media",
    category: "write",
  },
];

// Preset scope groups for easier selection
export const SCOPE_PRESETS = {
  READ_ONLY: [
    "posts:read",
    "categories:read",
    "tags:read",
    "authors:read",
    "media:read",
  ] as const,
  FULL_ACCESS: [
    "posts:read",
    "posts:write",
    "categories:read",
    "categories:write",
    "tags:read",
    "tags:write",
    "authors:read",
    "authors:write",
    "media:read",
    "media:write",
  ] as const,
};

export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name cannot be empty" })
    .max(50, { message: "Name cannot be more than 50 characters" }),
  scopes: z
    .array(apiKeyScopeEnum)
    .min(1, { message: "Please select at least one permission" }),
  expiresAt: z.date().optional().nullable(),
});

export type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

export const apiKeyToggleSchema = z.object({
  enabled: z.boolean(),
});

export type ApiKeyToggleValues = z.infer<typeof apiKeyToggleSchema>;

// Helper function to check if a scope is allowed for an API key
export function hasScope(
  scopes: string[],
  requiredScope: ApiKeyScope
): boolean {
  return scopes.includes(requiredScope);
}

// Helper function to check if API key has either read or write access
export function hasAnyScope(
  scopes: string[],
  resource: "posts" | "categories" | "tags" | "authors" | "media"
): boolean {
  return (
    scopes.includes(`${resource}:read`) || scopes.includes(`${resource}:write`)
  );
}

// Helper function to check if API key can write to a resource
export function canWrite(
  scopes: string[],
  resource: "posts" | "categories" | "tags" | "authors" | "media"
): boolean {
  return scopes.includes(`${resource}:write`);
}

// Helper function to check if API key can read from a resource
export function canRead(
  scopes: string[],
  resource: "posts" | "categories" | "tags" | "authors" | "media"
): boolean {
  return (
    scopes.includes(`${resource}:read`) || scopes.includes(`${resource}:write`)
  );
}
