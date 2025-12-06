import type { Loader } from "astro/loaders";
import { categoryEntrySchema } from "../schemas";
import type { AstraCMSConfig, Category } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the categories loader
 */
export interface CategoriesLoaderOptions extends AstraCMSConfig {
    /**
     * Search query to filter categories by name
     */
    query?: string;
}

/**
 * Astro Content Collection loader for AstraCMS categories
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { categoriesLoader } from '@astracms/astro-loader';
 *
 * const categories = defineCollection({
 *   loader: categoriesLoader({
 *     apiUrl: 'https://api.astracms.dev',
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *   }),
 * });
 *
 * export const collections = { categories };
 * ```
 */
export function categoriesLoader(options: CategoriesLoaderOptions): Loader {
    const { apiUrl, workspaceId, apiKey, query } = options;

    return {
        name: "astracms-categories-loader",

        async load({ store, logger, parseData, generateDigest }) {
            logger.info("Loading categories from AstraCMS...");

            try {
                const categories = await fetchAllPages<"categories">({
                    endpoint: "categories",
                    apiUrl,
                    workspaceId,
                    apiKey,
                    params: {
                        query,
                    },
                });

                store.clear();

                for (const category of categories as Category[]) {
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

                logger.info(`Loaded ${categories.length} categories from AstraCMS`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error(`Failed to load categories: ${message}`);
                throw error;
            }
        },

        schema: categoryEntrySchema,
    };
}
