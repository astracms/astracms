import type { Loader } from "astro/loaders";
import { authorEntrySchema } from "../schemas";
import type { AstraCMSConfig, Author } from "../types";
import { fetchAllPages } from "../utils/api";

/**
 * Options for the authors loader
 */
export interface AuthorsLoaderOptions extends AstraCMSConfig {
    /**
     * Search query to filter authors by name
     */
    query?: string;
}

/**
 * Astro Content Collection loader for AstraCMS authors
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { authorsLoader } from '@astracms/astro-loader';
 *
 * const authors = defineCollection({
 *   loader: authorsLoader({
 *     apiUrl: 'https://api.astracms.dev',
 *     apiKey: import.meta.env.ASTRACMS_API_KEY,
 *   }),
 * });
 *
 * export const collections = { authors };
 * ```
 */
export function authorsLoader(options: AuthorsLoaderOptions): Loader {
    const { apiUrl, workspaceId, apiKey, query } = options;

    return {
        name: "astracms-authors-loader",

        async load({ store, logger, parseData, generateDigest }) {
            logger.info("Loading authors from AstraCMS...");

            try {
                const authors = await fetchAllPages<"authors">({
                    endpoint: "authors",
                    apiUrl,
                    workspaceId,
                    apiKey,
                    params: {
                        query,
                    },
                });

                store.clear();

                for (const author of authors as Author[]) {
                    const data = await parseData({
                        id: author.slug,
                        data: {
                            name: author.name,
                            slug: author.slug,
                            bio: author.bio,
                            image: author.image,
                            role: author.role,
                            socials: author.socials,
                        },
                    });

                    const digest = generateDigest(data);

                    store.set({
                        id: author.slug,
                        data,
                        digest,
                    });
                }

                logger.info(`Loaded ${authors.length} authors from AstraCMS`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error(`Failed to load authors: ${message}`);
                throw error;
            }
        },

        schema: authorEntrySchema,
    };
}
