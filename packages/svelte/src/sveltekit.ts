import {
  type AstraCMSClient,
  type AstraCMSConfig,
  createAstraCMSClient,
  type GetPostsOptions,
  type Post,
} from "@astracms/core";

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

/**
 * SvelteKit load function helper for fetching posts
 *
 * @example
 * ```ts
 * // +page.server.ts
 * import { loadPosts } from '@astracms/svelte';
 *
 * export const load = loadPosts({
 *   apiUrl: 'https://api.astracms.dev',
 *   apiKey: env.ASTRACMS_API_KEY,
 * });
 * ```
 */
export function loadPosts(
  config: AstraCMSConfig,
  options: GetPostsOptions = {}
) {
  return async () => {
    const client = createAstraCMSClient(config);
    const posts = await client.getPosts(options);
    return { posts };
  };
}

/**
 * SvelteKit load function helper for fetching a single post
 *
 * @example
 * ```ts
 * // +page.server.ts
 * import { loadPost } from '@astracms/svelte';
 *
 * export async function load({ params }) {
 *   const client = createAstraCMSClient({ ... });
 *   const post = await client.getPost(params.slug);
 *   if (!post) throw error(404, 'Post not found');
 *   return { post };
 * }
 * ```
 */
export async function loadPost(
  client: AstraCMSClient,
  slug: string,
  options: { format?: "html" | "markdown" } = {}
): Promise<Post | null> {
  return client.getPost(slug, options);
}

/**
 * Create a SvelteKit load function that fetches all CMS data
 *
 * @example
 * ```ts
 * // +layout.server.ts
 * import { createLoadAll } from '@astracms/svelte';
 *
 * export const load = createLoadAll({
 *   apiUrl: 'https://api.astracms.dev',
 *   apiKey: env.ASTRACMS_API_KEY,
 * });
 * ```
 */
export function createLoadAll(config: AstraCMSConfig) {
  return async () => {
    const client = createAstraCMSClient(config);
    const [posts, categories, tags, authors] = await Promise.all([
      client.getPosts(),
      client.getCategories(),
      client.getTags(),
      client.getAuthors(),
    ]);
    return { posts, categories, tags, authors };
  };
}
