import type { Loader } from "astro/loaders";
import { postSchema } from "../schemas";
import type { AstraCMSConfig, Post } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the posts loader
 */
export interface PostsLoaderOptions extends AstraCMSConfig {
    /**
     * Filter posts by category slugs
     * @example ["technology", "business"]
     */
    categories?: string[];

    /**
     * Exclude posts from these category slugs
     */
    excludeCategories?: string[];

    /**
     * Filter posts by tag slugs
     * @example ["javascript", "react"]
     */
    tags?: string[];

    /**
     * Exclude posts with these tag slugs
     */
    excludeTags?: string[];

    /**
     * Content format returned by the API
     * - "html": Returns rendered HTML (default from CMS)
     * - "markdown": Returns markdown for use with Astro's markdown processing
     * @default "markdown"
     */
    format?: "html" | "markdown";

    /**
     * Search query to filter posts by title or content
     */
    query?: string;
}

/**
 * Astro Content Collection loader for AstraCMS posts
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { postsLoader } from '@astracms/astro-loader';
 *
 * const posts = defineCollection({
 *   loader: postsLoader({
 *     apiUrl: 'https://api.astracms.dev',
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *     format: 'markdown',
 *   }),
 * });
 *
 * export const collections = { posts };
 * ```
 */
export function postsLoader(options: PostsLoaderOptions): Loader {
    const {
        apiUrl,
        workspaceId,
        apiKey,
        format = "markdown",
        categories,
        excludeCategories,
        tags,
        excludeTags,
        query,
    } = options;

    return {
        name: "astracms-posts-loader",

        async load(context) {
            const { store, logger, parseData, generateDigest } = context;

            logger.info("Loading posts from AstraCMS...");

            try {
                const posts = await fetchAllPages<"posts">({
                    endpoint: "posts",
                    apiUrl,
                    workspaceId,
                    apiKey,
                    params: {
                        format,
                        categories: categories?.join(","),
                        excludeCategories: excludeCategories?.join(","),
                        tags: tags?.join(","),
                        excludeTags: excludeTags?.join(","),
                        query,
                    },
                });

                store.clear();

                for (const post of posts as Post[]) {
                    const data = await parseData({
                        id: post.slug,
                        data: {
                            title: post.title,
                            description: post.description,
                            slug: post.slug,
                            coverImage: post.coverImage,
                            featured: post.featured,
                            publishedAt: new Date(post.publishedAt),
                            updatedAt: new Date(post.updatedAt),
                            category: post.category,
                            tags: post.tags,
                            authors: post.authors,
                            attribution: post.attribution,
                        },
                    });

                    const digest = generateDigest(data);

                    // Store the content for rendering
                    // If format is markdown, Astro will process it with renderMarkdown
                    // If format is html, we store it as pre-rendered HTML
                    if (format === "markdown" && "renderMarkdown" in context) {
                        // Astro 5.9+ has renderMarkdown
                        const rendered = await (
                            context as { renderMarkdown: (md: string) => Promise<{ html: string }> }
                        ).renderMarkdown(post.content);

                        store.set({
                            id: post.slug,
                            data,
                            digest,
                            body: post.content,
                            rendered,
                        });
                    } else {
                        // For HTML or older Astro versions, store as pre-rendered
                        store.set({
                            id: post.slug,
                            data,
                            digest,
                            body: post.content,
                            rendered: {
                                html: post.content,
                            },
                        });
                    }
                }

                logger.info(`Loaded ${posts.length} posts from AstraCMS`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error(`Failed to load posts: ${message}`);
                throw error;
            }
        },

        schema: postSchema,
    };
}
