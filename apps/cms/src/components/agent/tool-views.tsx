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
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
        <div className="size-2 animate-pulse rounded-full bg-blue-500" />
        <span className="text-blue-700 dark:text-blue-300">
          Creating tag "{input?.name ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.tag) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
          <span className="text-green-700 dark:text-green-300">
            ✅ Tag "{output.tag.name}" created successfully
          </span>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm dark:border-purple-800 dark:bg-purple-950/30">
        <div className="size-2 animate-pulse rounded-full bg-purple-500" />
        <span className="text-purple-700 dark:text-purple-300">
          Creating category "{input?.name ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.category) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
          <span className="text-green-700 dark:text-green-300">
            ✅ Category "{output.category.name}" created successfully
          </span>
        </div>
      );
    }
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm dark:border-indigo-800 dark:bg-indigo-950/30">
        <div className="size-2 animate-pulse rounded-full bg-indigo-500" />
        <span className="text-indigo-700 dark:text-indigo-300">
          Creating post "{input?.title ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    // Check for failure: either success is false OR there's an actual error message
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Error: {output.error || "Unknown error"}
          </span>
        </div>
      );
    }
    // Success case
    if (output.post) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
          <span className="text-green-700 dark:text-green-300">
            ✅ Post created successfully
          </span>
          <div className="ml-6 space-y-1 text-green-600 text-xs dark:text-green-400">
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
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="size-2 animate-pulse rounded-full bg-amber-500" />
        <span className="text-amber-700 dark:text-amber-300">
          Searching for "{input?.query ?? "..."}"...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Error: {output.error}
          </span>
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
        <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/30">
          <span className="text-gray-700 dark:text-gray-300">
            No results found for "{input?.query ?? "search"}"
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
        <span className="text-green-700 dark:text-green-300">
          ✅ Found {totalResults} result{totalResults !== 1 ? "s" : ""}
        </span>
        <div className="ml-6 space-y-2 text-green-600 text-xs dark:text-green-400">
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
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="size-2 animate-pulse rounded-full bg-amber-500" />
        <span className="text-amber-700 dark:text-amber-300">
          Loading {input?.type ?? "resources"}...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Error: {output.error}
          </span>
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
      <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
        <span className="text-green-700 dark:text-green-300">
          ✅ Found {pagination?.total || results.length} {resourceType}
          {(pagination?.total || results.length) !== 1 ? "s" : ""}
        </span>
        <div className="ml-6 space-y-1 text-green-600 text-xs dark:text-green-400">
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
            <div className="mt-2 border-green-300 border-t pt-2 dark:border-green-700">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm dark:border-cyan-800 dark:bg-cyan-950/30">
        <div className="size-2 animate-pulse rounded-full bg-cyan-500" />
        <span className="text-cyan-700 dark:text-cyan-300">
          🌐 Searching the web for "{input?.query ?? "..."}..."
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
            ❌ Web search error: {output.error}
          </span>
        </div>
      );
    }

    const results = output.results || [];

    if (results.length === 0) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/30">
          <span className="text-gray-700 dark:text-gray-300">
            🌐 No web results found for "{input?.query ?? "search"}"
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm dark:border-cyan-800 dark:bg-cyan-950/30">
        <span className="text-cyan-700 dark:text-cyan-300">
          🌐 Found {results.length} web result{results.length !== 1 ? "s" : ""}
        </span>
        {output.answer && (
          <div className="rounded border border-cyan-300 bg-white/50 p-2 text-cyan-800 text-xs dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200">
            <strong>Summary:</strong> {output.answer}
          </div>
        )}
        <div className="ml-2 space-y-1 text-cyan-600 text-xs dark:text-cyan-400">
          {results.slice(0, 5).map((result, index) => (
            <div className="flex flex-col" key={`${result.url}-${index}`}>
              <a
                className="font-medium text-cyan-700 underline hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
                href={result.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {result.title}
              </a>
              <span className="line-clamp-1 text-cyan-500 dark:text-cyan-500">
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
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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
      <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-800 dark:bg-violet-950/30">
        <div className="size-2 animate-pulse rounded-full bg-violet-500" />
        <span className="text-violet-700 dark:text-violet-300">
          Preparing options...
        </span>
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
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
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

interface ListMediaToolViewProps extends ToolViewProps {
  onSelectImage?: (media: { id: string; url: string; name: string }) => void;
  onUploadClick?: () => void;
}

export function ListMediaView({
  invocation,
  onSelectImage,
  onUploadClick,
}: ListMediaToolViewProps) {
  const state = getState(invocation);
  const output = invocation?.output as ListMediaOutput | undefined;

  if (state === "input-available" || state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm dark:border-teal-800 dark:bg-teal-950/30">
        <div className="size-2 animate-pulse rounded-full bg-teal-500" />
        <span className="text-teal-700 dark:text-teal-300">
          Loading media library...
        </span>
      </div>
    );
  }

  if (state === "output-available" && output) {
    if (!output.success || output.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <span className="text-red-700 dark:text-red-300">
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
          {onUploadClick && (
            <button
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
              onClick={onUploadClick}
              type="button"
            >
              Upload an image
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="my-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">
            Select an image ({output.total ?? media.length} available)
          </p>
          {onUploadClick && (
            <button
              className="rounded-md border px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:border-primary hover:text-foreground"
              onClick={onUploadClick}
              type="button"
            >
              📤 Upload new
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {media.map((item) => (
            <button
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary"
              key={item.id}
              onClick={() => onSelectImage?.(item)}
              type="button"
            >
              <Image
                alt={item.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                height={100}
                src={item.url}
                width={100}
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="line-clamp-1 text-white text-xs">{item.name}</p>
              </div>
            </button>
          ))}
        </div>

        {output.hasMore && (
          <p className="text-center text-muted-foreground text-xs">
            Showing {media.length} of {output.total} images
          </p>
        )}
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
        <span className="text-red-700 dark:text-red-300">
          ❌ Error: {String(invocation?.errorText ?? "Unknown error")}
        </span>
      </div>
    );
  }

  return null;
}
