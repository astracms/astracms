/**
 * Configuration options for AstraCMS client
 */
export interface AstraCMSConfig {
    /**
     * AstraCMS API base URL
     * @example "https://api.astracms.dev"
     */
    apiUrl: string;

    /**
     * Workspace ID (required for v1 API)
     * Use this when you don't have an API key
     */
    workspaceId?: string;

    /**
     * API Key (required for v2 API, recommended)
     * More secure than workspace ID authentication
     */
    apiKey?: string;
}

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
