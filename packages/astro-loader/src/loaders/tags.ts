import type { Loader } from "astro/loaders";
import { tagEntrySchema } from "../schemas";
import type { AstraCMSConfig, Tag } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the tags loader
 */
export interface TagsLoaderOptions extends AstraCMSConfig {
    /**
     * Search query to filter tags by name
     */
    query?: string;
}

/**
 * Astro Content Collection loader for AstraCMS tags
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { tagsLoader } from '@astracms/astro-loader';
 *
 * const tags = defineCollection({
 *   loader: tagsLoader({
 *     apiUrl: 'https://api.astracms.dev',
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *   }),
 * });
 *
 * export const collections = { tags };
 * ```
 */
export function tagsLoader(options: TagsLoaderOptions): Loader {
    const { apiUrl, workspaceId, apiKey, query } = options;

    return {
        name: "astracms-tags-loader",

        async load({ store, logger, parseData, generateDigest }) {
            logger.info("Loading tags from AstraCMS...");

            try {
                const tags = await fetchAllPages<"tags">({
                    endpoint: "tags",
                    apiUrl,
                    workspaceId,
                    apiKey,
                    params: {
                        query,
                    },
                });

                store.clear();

                for (const tag of tags as Tag[]) {
                    const data = await parseData({
                        id: tag.slug,
                        data: {
                            name: tag.name,
                            slug: tag.slug,
                            description: tag.description,
                        },
                    });

                    const digest = generateDigest(data);

                    store.set({
                        id: tag.slug,
                        data,
                        digest,
                    });
                }

                logger.info(`Loaded ${tags.length} tags from AstraCMS`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error(`Failed to load tags: ${message}`);
                throw error;
            }
        },

        schema: tagEntrySchema,
    };
}
