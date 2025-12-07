/**
 * API version for AstraCMS
 * - v2: Recommended, requires apiKey
 * - v1: Legacy, requires workspaceId
 */
export type ApiVersion = "v1" | "v2";

/**
 * Base configuration shared between v1 and v2
 */
interface BaseConfig {
  /**
   * Override the default API URL (for testing/development only)
   * @internal
   */
  _apiUrl?: string;
}

/**
 * Configuration for v2 API (recommended)
 * Uses API key authentication for enhanced security
 */
export interface V2Config extends BaseConfig {
  /**
   * API version (defaults to 'v2' if not specified)
   */
  apiVersion?: "v2";

  /**
   * API Key for v2 authentication (required for v2)
   * More secure than workspace ID authentication
   */
  apiKey: string;
}

/**
 * Configuration for v1 API (legacy)
 * Uses workspace ID authentication
 */
export interface V1Config extends BaseConfig {
  /**
   * API version - must be 'v1' when using workspaceId
   */
  apiVersion: "v1";

  /**
   * Workspace ID for v1 authentication
   */
  workspaceId: string;
}

/**
 * Configuration options for AstraCMS client
 *
 * @example v2 (recommended)
 * ```ts
 * const client = createAstraCMSClient({
 *   apiKey: 'your-api-key',
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
export type AstraCMSConfig = V2Config | V1Config;

/**
 * Author social media link
 */
export interface AuthorSocial {
  platform: string;
  url: string;
}

/**
 * Author data from AstraCMS
 */
export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  image?: string | null;
  role?: string | null;
  socials: AuthorSocial[];
}

/**
 * Category data from AstraCMS
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

/**
 * Tag data from AstraCMS
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

/**
 * Post data from AstraCMS
 */
export interface Post {
  id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  coverImage?: string | null;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  category: Category;
  tags: Tag[];
  authors: Author[];
  attribution?: string | null;
}

/**
 * Pagination info from API responses
 */
export interface Pagination {
  limit: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  totalPages: number;
  totalItems: number;
}

/**
 * API response for posts list
 */
export interface PostsAPIResponse {
  posts: Post[];
  pagination: Pagination;
}

/**
 * API response for categories list
 */
export interface CategoriesAPIResponse {
  categories: Category[];
  pagination: Pagination;
}

/**
 * API response for tags list
 */
export interface TagsAPIResponse {
  tags: Tag[];
  pagination: Pagination;
}

/**
 * API response for authors list
 */
export interface AuthorsAPIResponse {
  authors: Author[];
  pagination: Pagination;
}

/**
 * Options for fetching posts
 */
export interface GetPostsOptions {
  /**
   * Filter posts by category slugs
   */
  categories?: string[];

  /**
   * Exclude posts from these category slugs
   */
  excludeCategories?: string[];

  /**
   * Filter posts by tag slugs
   */
  tags?: string[];

  /**
   * Exclude posts with these tag slugs
   */
  excludeTags?: string[];

  /**
   * Content format returned by the API
   * @default "html"
   */
  format?: "html" | "markdown";

  /**
   * Search query to filter posts by title or content
   */
  query?: string;

  /**
   * Maximum number of posts to return
   */
  limit?: number | "all";

  /**
   * Page number for pagination
   */
  page?: number;
}
