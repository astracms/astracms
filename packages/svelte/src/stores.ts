import {
  type AstraCMSClient,
  type AstraCMSConfig,
  type Author,
  type Category,
  createAstraCMSClient,
  type GetPostsOptions,
  type Post,
  type Tag,
} from "@astracms/core";
import { type Readable, readable, writable } from "svelte/store";

// Re-export types and values from core
export type {
  AstraCMSConfig,
  Author,
  Category,
  GetPostsOptions,
  Post,
  Tag,
} from "@astracms/core";
export { AstraCMSClient, createAstraCMSClient } from "@astracms/core";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Create Svelte stores for AstraCMS data
 *
 * @example
 * ```svelte
 * <script>
 *   import { createAstraCMSStores } from '@astracms/svelte';
 *
 *   const { posts, categories, tags, authors } = createAstraCMSStores({
 *     apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
 *   });
 * </script>
 *
 * {#if $posts.loading}
 *   <p>Loading...</p>
 * {:else if $posts.error}
 *   <p>Error: {$posts.error.message}</p>
 * {:else}
 *   <ul>
 *     {#each $posts.data ?? [] as post}
 *       <li>{post.title}</li>
 *     {/each}
 *   </ul>
 * {/if}
 * ```
 */
export function createAstraCMSStores(config: AstraCMSConfig) {
  const client = createAstraCMSClient(config);

  return {
    posts: createPostsStore(client),
    categories: createCategoriesStore(client),
    tags: createTagsStore(client),
    authors: createAuthorsStore(client),
    client,
  };
}

/**
 * Create a readable store for posts
 */
export function createPostsStore(
  client: AstraCMSClient,
  options: GetPostsOptions = {}
): Readable<AsyncState<Post[]>> {
  return readable<AsyncState<Post[]>>(
    { data: null, loading: true, error: null },
    (set) => {
      client
        .getPosts(options)
        .then((posts: Post[]) =>
          set({ data: posts, loading: false, error: null })
        )
        .catch((error: unknown) =>
          set({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        );
    }
  );
}

/**
 * Create a readable store for a single post
 */
export function createPostStore(
  client: AstraCMSClient,
  slug: string,
  options: { format?: "html" | "markdown" } = {}
): Readable<AsyncState<Post>> {
  return readable<AsyncState<Post>>(
    { data: null, loading: true, error: null },
    (set) => {
      client
        .getPost(slug, options)
        .then((post: Post | null) =>
          set({ data: post, loading: false, error: null })
        )
        .catch((error: unknown) =>
          set({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        );
    }
  );
}

/**
 * Create a readable store for categories
 */
export function createCategoriesStore(
  client: AstraCMSClient
): Readable<AsyncState<Category[]>> {
  return readable<AsyncState<Category[]>>(
    { data: null, loading: true, error: null },
    (set) => {
      client
        .getCategories()
        .then((categories: Category[]) =>
          set({ data: categories, loading: false, error: null })
        )
        .catch((error: unknown) =>
          set({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        );
    }
  );
}

/**
 * Create a readable store for tags
 */
export function createTagsStore(
  client: AstraCMSClient
): Readable<AsyncState<Tag[]>> {
  return readable<AsyncState<Tag[]>>(
    { data: null, loading: true, error: null },
    (set) => {
      client
        .getTags()
        .then((tags: Tag[]) => set({ data: tags, loading: false, error: null }))
        .catch((error: unknown) =>
          set({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        );
    }
  );
}

/**
 * Create a readable store for authors
 */
export function createAuthorsStore(
  client: AstraCMSClient
): Readable<AsyncState<Author[]>> {
  return readable<AsyncState<Author[]>>(
    { data: null, loading: true, error: null },
    (set) => {
      client
        .getAuthors()
        .then((authors: Author[]) =>
          set({ data: authors, loading: false, error: null })
        )
        .catch((error: unknown) =>
          set({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        );
    }
  );
}

/**
 * Create a writable search store with debouncing
 *
 * @example
 * ```svelte
 * <script>
 *   import { createSearchStore, createAstraCMSClient } from '@astracms/svelte';
 *
 *   const client = createAstraCMSClient({ ... });
 *   const search = createSearchStore(client);
 * </script>
 *
 * <input type="text" on:input={(e) => search.query.set(e.target.value)} />
 *
 * {#if $search.results.loading}
 *   <p>Searching...</p>
 * {:else}
 *   {#each $search.results.data ?? [] as post}
 *     <p>{post.title}</p>
 *   {/each}
 * {/if}
 * ```
 */
export function createSearchStore(
  client: AstraCMSClient,
  options: { debounceMs?: number } = {}
) {
  const { debounceMs = 300 } = options;
  const query = writable("");
  const results = writable<AsyncState<Post[]>>({
    data: [],
    loading: false,
    error: null,
  });
  let timer: ReturnType<typeof setTimeout> | null = null;

  query.subscribe((q) => {
    if (timer) clearTimeout(timer);

    if (!q.trim()) {
      results.set({ data: [], loading: false, error: null });
      return;
    }

    results.update((state) => ({ ...state, loading: true }));

    timer = setTimeout(async () => {
      try {
        const posts = await client.getPosts({ query: q });
        results.set({ data: posts, loading: false, error: null });
      } catch (error) {
        results.set({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }, debounceMs);
  });

  return { query, results };
}
