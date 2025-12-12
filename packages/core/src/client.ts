import type {
  AstraCMSConfig,
  Author,
  Category,
  GetPostsOptions,
  Post,
  Tag,
  V1Config,
} from "./types";

type Endpoint = "posts" | "categories" | "tags" | "authors";

interface FetchOptions {
  endpoint: Endpoint;
  params?: Record<string, string | number | undefined>;
}

/** Default API URL for AstraCMS */
const DEFAULT_API_URL = "https://api.astracms.dev";

/**
 * Type guard to check if config is V1Config
 */
function isV1Config(config: AstraCMSConfig): config is V1Config {
  return config.apiVersion === "v1";
}

/**
 * AstraCMS API Client
 *
 * @example v2 (recommended)
 * ```ts
 * const client = new AstraCMSClient({
 *   apiKey: process.env.ASTRACMS_API_KEY,
 * });
 *
 * const posts = await client.getPosts();
 * ```
 *
 * @example v1 (legacy)
 * ```ts
 * const client = new AstraCMSClient({
 *   apiVersion: 'v1',
 *   workspaceId: 'your-workspace-id',
 * });
 * ```
 */
export class AstraCMSClient {
  private readonly config: AstraCMSConfig;
  private readonly isV1: boolean;

  constructor(config: AstraCMSConfig) {
    this.config = config;
    this.isV1 = isV1Config(config);
  }

  /**
   * Make an API request to AstraCMS
   */
  private async fetch<T>(options: FetchOptions): Promise<T> {
    const { endpoint, params } = options;

    // Build URL based on API version
    const baseUrl = this.isV1
      ? `${DEFAULT_API_URL}/v1/${(this.config as V1Config).workspaceId}/${endpoint}`
      : `${DEFAULT_API_URL}/v2/${endpoint}`;

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

    // Add API key for v2
    if (!this.isV1) {
      headers.Authorization = `Bearer ${(this.config as { apiKey: string }).apiKey}`;
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
    const { format = "html" } = options;

    try {
      const response = await this.fetch<{ post: Post }>({
        endpoint: `posts/${encodeURIComponent(slug)}` as Endpoint,
        params: { format },
      });

      return response.post;
    } catch (error) {
      // Return null if post not found (404)
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
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
 * @example v2 (recommended)
 * ```ts
 * const client = createAstraCMSClient({
 *   apiKey: process.env.ASTRACMS_API_KEY,
 * });
 * ```
 *
 * @example v1 (legacy)
 * ```ts
 * const client = createAstraCMSClient({
 *   apiVersion: 'v1',
 *   workspaceId: 'your-workspace-id',
 * });
 * ```
 */
export function createAstraCMSClient(config: AstraCMSConfig): AstraCMSClient {
  return new AstraCMSClient(config);
}
