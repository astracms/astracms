import type {
    AstraCMSConfig,
    Author,
    Category,
    GetPostsOptions,
    Post,
    Tag,
} from "./types";

type Endpoint = "posts" | "categories" | "tags" | "authors";

interface FetchOptions {
    endpoint: Endpoint;
    params?: Record<string, string | number | undefined>;
}

/**
 * AstraCMS API Client
 *
 * @example
 * ```ts
 * const client = new AstraCMSClient({
 *   apiUrl: 'https://api.astracms.dev',
 *   apiKey: process.env.ASTRACMS_API_KEY,
 * });
 *
 * const posts = await client.getPosts();
 * ```
 */
export class AstraCMSClient {
    private readonly config: AstraCMSConfig;

    constructor(config: AstraCMSConfig) {
        if (!config.apiKey && !config.workspaceId) {
            throw new Error(
                "AstraCMS Client: Either apiKey (recommended) or workspaceId is required"
            );
        }
        this.config = config;
    }

    /**
     * Make an API request to AstraCMS
     */
    private async fetch<T>(options: FetchOptions): Promise<T> {
        const { endpoint, params } = options;
        const { apiUrl, workspaceId, apiKey } = this.config;

        // Determine API version based on authentication method
        const isV2 = Boolean(apiKey);
        const baseUrl = isV2
            ? `${apiUrl}/v2/${endpoint}`
            : `${apiUrl}/v1/${workspaceId}/${endpoint}`;

        const url = new URL(baseUrl);

        // Add query params
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== "") {
                    url.searchParams.set(key, String(value));
                }
            }
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (apiKey) {
            headers.Authorization = `Bearer ${apiKey}`;
        }

        const response = await fetch(url.toString(), { headers });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `AstraCMS API error (${response.status}): ${response.statusText}. ${errorBody}`
            );
        }

        return response.json() as Promise<T>;
    }

    /**
     * Fetch all posts with optional filtering
     */
    async getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
        const {
            categories,
            excludeCategories,
            tags,
            excludeTags,
            format = "html",
            query,
            limit = "all",
            page,
        } = options;

        const response = await this.fetch<{ posts: Post[] }>({
            endpoint: "posts",
            params: {
                format,
                categories: categories?.join(","),
                excludeCategories: excludeCategories?.join(","),
                tags: tags?.join(","),
                excludeTags: excludeTags?.join(","),
                query,
                limit: String(limit),
                page,
            },
        });

        return response.posts;
    }

    /**
     * Fetch a single post by slug
     */
    async getPost(
        slug: string,
        options: { format?: "html" | "markdown" } = {}
    ): Promise<Post | null> {
        const posts = await this.getPosts({
            ...options,
            query: slug,
            limit: 1,
        });

        // Find exact slug match
        return posts.find((p) => p.slug === slug) ?? null;
    }

    /**
     * Fetch all categories
     */
    async getCategories(): Promise<Category[]> {
        const response = await this.fetch<{ categories: Category[] }>({
            endpoint: "categories",
            params: { limit: "all" },
        });

        return response.categories;
    }

    /**
     * Fetch all tags
     */
    async getTags(): Promise<Tag[]> {
        const response = await this.fetch<{ tags: Tag[] }>({
            endpoint: "tags",
            params: { limit: "all" },
        });

        return response.tags;
    }

    /**
     * Fetch all authors
     */
    async getAuthors(): Promise<Author[]> {
        const response = await this.fetch<{ authors: Author[] }>({
            endpoint: "authors",
            params: { limit: "all" },
        });

        return response.authors;
    }
}

/**
 * Create an AstraCMS client instance
 *
 * @example
 * ```ts
 * const client = createAstraCMSClient({
 *   apiUrl: 'https://api.astracms.dev',
 *   apiKey: process.env.ASTRACMS_API_KEY,
 * });
 * ```
 */
export function createAstraCMSClient(config: AstraCMSConfig): AstraCMSClient {
    return new AstraCMSClient(config);
}
