import type { Loader } from "astro/loaders";
import { categoryEntrySchema } from "../schemas";
import type { AstraCMSConfig, Category } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the categories loader
 */
export type CategoriesLoaderOptions = AstraCMSConfig & {
  /**
   * Search query to filter categories by name
   */
  query?: string;

  /**
   * Exclude categories with these slugs
   * @example ["page", "internal"]
   */
  excludeCategories?: string[];
};

/**
 * Astro Content Collection loader for AstraCMS categories
 *
 * @example v2 (recommended)
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { categoriesLoader } from '@astracms/astro-loader';
 *
 * const categories = defineCollection({
 *   loader: categoriesLoader({
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *     excludeCategories: ["page"],
 *   }),
 * });
 *
 * export const collections = { categories };
 * ```
 */
export function categoriesLoader(options: CategoriesLoaderOptions): Loader {
  const { query, excludeCategories, ...config } = options;

  return {
    name: "astracms-categories-loader",

    async load({ store, logger, parseData, generateDigest }) {
      logger.info("Loading categories from AstraCMS...");

      try {
        const allCategories = await fetchAllPages<"categories">({
          ...config,
          endpoint: "categories",
          params: {
            query,
          },
        });

        // Filter out excluded categories
        let filteredCategories = allCategories as Category[];
        if (excludeCategories && excludeCategories.length > 0) {
          filteredCategories = filteredCategories.filter(
            (cat) => !excludeCategories.includes(cat.slug)
          );
        }

        store.clear();

        for (const category of filteredCategories) {
          const data = await parseData({
            id: category.slug,
            data: {
              name: category.name,
              slug: category.slug,
              description: category.description,
            },
          });

          const digest = generateDigest(data);

          store.set({
            id: category.slug,
            data,
            digest,
          });
        }

        logger.info(
          `Loaded ${filteredCategories.length} categories from AstraCMS`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to load categories: ${message}`);
        throw error;
      }
    },

    schema: categoryEntrySchema,
  };
}
