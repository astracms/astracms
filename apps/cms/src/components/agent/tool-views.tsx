"use client";

import Image from "next/image";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Props for tool view components
 * Using 'any' because AI SDK v5 part types are complex unions
 */
interface ToolViewProps {
  invocation: any;
  respondToConfirmationRequest?: (params: {
    approvalId: string;
    approved: boolean;
  }) => void;
}

/**
 * Helper to safely get state from invocation
 */
function getState(inv: any): string {
  return inv?.state ?? "";
}

export function AddTagView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as
    | { name?: string; slug?: string }
    | undefined;
  const output = invocation?.output as
    | {
        success: boolean;
        tag?: { id: string; name: string; slug: string };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Creating tag "{input?.name ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.tag) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-foreground">
            ✅ Tag "{output.tag.name}" created successfully
          </span>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function AddCategoryView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as
    | { name?: string; slug?: string }
    | undefined;
  const output = invocation?.output as
    | {
        success: boolean;
        category?: { id: string; name: string; slug: string };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Creating category "{input?.name ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.category) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-foreground">
            ✅ Category "{output.category.name}" created successfully
          </span>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function CreatePostView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as { title?: string } | undefined;
  const output = invocation?.output as
    | {
        success: boolean;
        post?: { id: string; slug: string; title: string };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Creating post "{input?.title ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.post) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-foreground">✅ Post created successfully</span>
          <div className="ml-6 space-y-1 text-muted-foreground text-xs">
            <div>
              <strong>Title:</strong> {output.post.title}
            </div>
            <div>
              <strong>Slug:</strong> {output.post.slug}
            </div>
          </div>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function SearchView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as { query?: string } | undefined;
  const output = invocation?.output as
    | {
        results?: {
          posts?: Array<{
            id: string;
            title: string;
            slug: string;
            status: string;
          }>;
          tags?: Array<{ id: string; name: string; slug: string }>;
          categories?: Array<{ id: string; name: string; slug: string }>;
        };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Searching for "{input?.query ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">❌ Error: {output.error}</span>
        </div>
      );
    }

    const results = output.results;
    const totalResults =
      (results?.posts?.length || 0) +
      (results?.tags?.length || 0) +
      (results?.categories?.length || 0);

    if (totalResults === 0) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-muted-foreground">
            No results found for "{input?.query ?? "search"}"
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
        <span className="text-foreground">
          ✅ Found {totalResults} result{totalResults !== 1 ? "s" : ""}
        </span>
        <div className="ml-6 space-y-2 text-muted-foreground text-xs">
          {results?.posts && results.posts.length > 0 && (
            <div>
              <strong>Posts ({results.posts.length}):</strong>
              <ul className="ml-2 list-inside list-disc">
                {results.posts.map((post) => (
                  <li key={post.id}>{post.title}</li>
                ))}
              </ul>
            </div>
          )}
          {results?.tags && results.tags.length > 0 && (
            <div>
              <strong>Tags ({results.tags.length}):</strong>
              <ul className="ml-2 list-inside list-disc">
                {results.tags.map((tag) => (
                  <li key={tag.id}>{tag.name}</li>
                ))}
              </ul>
            </div>
          )}
          {results?.categories && results.categories.length > 0 && (
            <div>
              <strong>Categories ({results.categories.length}):</strong>
              <ul className="ml-2 list-inside list-disc">
                {results.categories.map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function ListResourcesView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as
    | { type?: string; page?: number; limit?: number }
    | undefined;
  const output = invocation?.output as
    | {
        results?: Record<string, unknown>[];
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Loading {input?.type ?? "resources"}...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">❌ Error: {output.error}</span>
        </div>
      );
    }

    const results = output.results || [];
    const pagination = output.pagination;

    if (results.length === 0) {
      return null; // Don't show anything if no results - let the agent's text response handle it
    }

    const resourceType = input?.type || "items";

    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
        <span className="text-foreground">
          ✅ Found {pagination?.total || results.length} {resourceType}
          {(pagination?.total || results.length) !== 1 ? "s" : ""}
        </span>
        <div className="ml-6 space-y-1 text-muted-foreground text-xs">
          <ul className="list-inside list-disc space-y-1">
            {results.map((item, idx) => {
              const record = item as Record<string, unknown>;
              const name = (record.name || record.title) as string;
              const slug = record.slug as string;
              const description = record.description as string;
              const id = record.id as string;

              return (
                <li key={id || idx}>
                  <strong>{name}</strong>
                  {slug && ` (slug: ${slug})`}
                  {description && ` - ${description}`}
                </li>
              );
            })}
          </ul>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-2 border-border border-t pt-2">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function WebSearchView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as { query?: string } | undefined;
  const output = invocation?.output as
    | {
        results?: Array<{
          title: string;
          url: string;
          content: string;
          score?: number;
        }>;
        answer?: string;
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          🌐 Searching the web for "{input?.query ?? "..."}..."
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Web search error: {output.error}
          </span>
        </div>
      );
    }

    const results = output.results || [];

    if (results.length === 0) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-muted-foreground">
            🌐 No web results found for "{input?.query ?? "search"}"
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
        <span className="text-foreground">
          🌐 Found {results.length} web result{results.length !== 1 ? "s" : ""}
        </span>
        {output.answer && (
          <div className="rounded border bg-background/50 p-2 text-muted-foreground text-xs">
            <strong>Summary:</strong> {output.answer}
          </div>
        )}
        <div className="ml-2 space-y-1 text-muted-foreground text-xs">
          {results.slice(0, 5).map((result, index) => (
            <div className="flex flex-col" key={`${result.url}-${index}`}>
              <a
                className="font-medium text-foreground underline hover:text-primary"
                href={result.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {result.title}
              </a>
              <span className="line-clamp-1 text-muted-foreground">
                {result.content.slice(0, 100)}...
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

interface PresentOptionsInput {
  type?: "title" | "description" | "category" | "tag" | "image" | "custom";
  prompt?: string;
  options?: Array<{
    id: string;
    label: string;
    description?: string;
    value: string;
    imageUrl?: string;
  }>;
  allowCustom?: boolean;
  allowRegenerate?: boolean;
}

interface PresentOptionsToolViewProps extends ToolViewProps {
  onOptionSelect?: (value: string) => void;
  onRegenerate?: () => void;
}

export function PresentOptionsView({
  invocation,
  onOptionSelect,
  onRegenerate,
}: PresentOptionsToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as PresentOptionsInput | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">Preparing options...</span>
      </div>
    );
  }

  if (state === "output-available" && input?.options) {
    const {
      type = "custom",
      prompt,
      options,
      allowCustom,
      allowRegenerate,
    } = input;
    const isImageType = type === "image";

    return (
      <div className="my-3 space-y-3">
        {prompt && <p className="font-medium text-foreground">{prompt}</p>}

        <div
          className={
            isImageType ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "space-y-2"
          }
        >
          {options.map((option) => (
            <button
              className={`group w-full rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                isImageType ? "aspect-video overflow-hidden p-0" : ""
              }`}
              key={option.id}
              onClick={() => onOptionSelect?.(option.value)}
              type="button"
            >
              {isImageType && option.imageUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    alt={option.label}
                    className="h-full w-full object-cover"
                    height={200}
                    src={option.imageUrl}
                    width={300}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2">
                    <p className="line-clamp-1 text-white text-xs">
                      {option.label}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm">{option.label}</p>
                  {option.description && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      {option.description}
                    </p>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {allowRegenerate && (
            <button
              className="rounded-md border px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:border-primary hover:text-foreground"
              onClick={onRegenerate}
              type="button"
            >
              🔄 Regenerate
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

interface ListMediaOutput {
  success: boolean;
  media?: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
  }>;
  hasMore?: boolean;
  total?: number;
  error?: string;
}

export function ListMediaView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const output = invocation?.output as ListMediaOutput | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">Loading media library...</span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Error: {output.error || "Failed to load media"}
          </span>
        </div>
      );
    }

    const media = output.media || [];

    if (media.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No images found in your media library
          </p>
        </div>
      );
    }

    const displayMedia = media.slice(0, 4);
    const hasMore = media.length > 4 || output.hasMore;
    const totalCount = output.total ?? media.length;

    return (
      <div className="my-3 space-y-3">
        <p className="font-medium text-sm">
          Media Library ({totalCount} available)
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {displayMedia.map((item) => (
            <div
              className="group relative aspect-square overflow-hidden rounded-lg border"
              key={item.id}
            >
              <Image
                alt={item.name}
                className="h-full w-full object-cover"
                height={100}
                src={item.url}
                width={100}
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-1.5">
                <p className="line-clamp-1 text-white text-xs">{item.name}</p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <p className="text-center text-muted-foreground text-sm">
            View more in Media Library
          </p>
        )}
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}

export function CreateBlogAutoView({ invocation }: ToolViewProps) {
  const state = getState(invocation);
  const input = invocation?.input as { topic?: string } | undefined;
  const output = invocation?.output as
    | {
        success: boolean;
        post?: {
          id: string;
          slug: string;
          title: string;
          category: string;
          tags: string[];
          wordCount: number;
          editUrl: string;
        };
        error?: string;
      }
    | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <span className="text-muted-foreground">
          Creating blog post about "{input?.topic ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
          <span className="text-destructive">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }

    // Success case
    if (output.post) {
      return (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
          <span className="text-foreground">
            ✅ Blog post created successfully
          </span>
          <div className="ml-6 space-y-1.5 text-muted-foreground text-xs">
            <div>
              <strong>Title:</strong> {output.post.title}
            </div>
            <div>
              <strong>Category:</strong> {output.post.category}
            </div>
            <div>
              <strong>Tags:</strong> {output.post.tags.join(", ")}
            </div>
            <div>
              <strong>Word Count:</strong> {output.post.wordCount} words
            </div>
            <div className="pt-1">
              <a
                className="font-medium text-primary underline hover:text-primary/80"
                href={output.post.editUrl}
                rel="noopener noreferrer"
              >
                Edit post →
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-destructive/10 p-3 text-sm">
        <span className="text-destructive">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}
