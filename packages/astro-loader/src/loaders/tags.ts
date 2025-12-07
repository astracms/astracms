import type { Loader } from "astro/loaders";
import { tagEntrySchema } from "../schemas";
import type { AstraCMSConfig, Tag } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the tags loader
 */
export type TagsLoaderOptions = AstraCMSConfig & {
  /**
   * Search query to filter tags by name
   */
  query?: string;
};

/**
 * Astro Content Collection loader for AstraCMS tags
 *
 * @example v2 (recommended)
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { tagsLoader } from '@astracms/astro-loader';
 *
 * const tags = defineCollection({
 *   loader: tagsLoader({
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *   }),
 * });
 *
 * export const collections = { tags };
 * ```
 */
export function tagsLoader(options: TagsLoaderOptions): Loader {
  const { query, ...config } = options;

  return {
    name: "astracms-tags-loader",

    async load({ store, logger, parseData, generateDigest }) {
      logger.info("Loading tags from AstraCMS...");

      try {
        const tags = await fetchAllPages<"tags">({
          ...config,
          endpoint: "tags",
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
