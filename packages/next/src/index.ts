import {
    type AstraCMSClient,
    type AstraCMSConfig,
    type Author,
    type Category,
    createAstraCMSClient,
    type GetPostsOptions,
    type Post,
    type Tag,
} from "@astracms/core";
import { cache } from "react";

export type {
    AstraCMSConfig,
    Author,
    Category,
    GetPostsOptions,
    Post,
    Tag,
} from "@astracms/core";
// Re-export for convenience
export { AstraCMSClient, createAstraCMSClient } from "@astracms/core";

// ----- Server-side cached data fetching -----

let defaultClient: AstraCMSClient | null = null;

/**
 * Configure the default AstraCMS client for server components
 * Call this in your root layout or a server-side module
 */
export function configureAstraCMS(config: AstraCMSConfig): void {
    defaultClient = createAstraCMSClient(config);
}

/**
 * Get the configured client, or create one from environment variables
 */
function getClient(): AstraCMSClient {
    if (defaultClient) {
        return defaultClient;
    }

    // Try to create from environment variables
    const apiKey =
        process.env.ASTRACMS_API_KEY ?? process.env.NEXT_PUBLIC_ASTRACMS_API_KEY;
    const workspaceId =
        process.env.ASTRACMS_WORKSPACE_ID ??
        process.env.NEXT_PUBLIC_ASTRACMS_WORKSPACE_ID;

    // V2 API (recommended): Use API key authentication
    if (apiKey) {
        defaultClient = createAstraCMSClient({ apiKey });
        return defaultClient;
    }

    // V1 API (legacy): Use workspace ID authentication
    if (workspaceId) {
        defaultClient = createAstraCMSClient({ apiVersion: "v1", workspaceId });
        return defaultClient;
    }

    throw new Error(
        "AstraCMS: No configuration found. Either call configureAstraCMS() or set ASTRACMS_API_KEY (recommended) or ASTRACMS_WORKSPACE_ID environment variable."
    );
}

/**
 * Fetch all posts (cached per-request with React cache)
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function BlogPage() {
 *   const posts = await getPosts();
 *   return <PostsList posts={posts} />;
 * }
 * ```
 */
export const getPosts = cache(
    async (options: GetPostsOptions = {}): Promise<Post[]> => {
        const client = getClient();
        return client.getPosts(options);
    }
);

/**
 * Fetch a single post by slug (cached per-request)
 *
 * @example
 * ```tsx
 * export default async function PostPage({ params }: { params: { slug: string } }) {
 *   const post = await getPost(params.slug);
 *   if (!post) return notFound();
 *   return <PostContent post={post} />;
 * }
 * ```
 */
export const getPost = cache(
    async (
        slug: string,
        options: { format?: "html" | "markdown" } = {}
    ): Promise<Post | null> => {
        const client = getClient();
        return client.getPost(slug, options);
    }
);

/**
 * Fetch all categories (cached per-request)
 */
export const getCategories = cache(async (): Promise<Category[]> => {
    const client = getClient();
    return client.getCategories();
});

/**
 * Fetch all tags (cached per-request)
 */
export const getTags = cache(async (): Promise<Tag[]> => {
    const client = getClient();
    return client.getTags();
});

/**
 * Fetch all authors (cached per-request)
 */
export const getAuthors = cache(async (): Promise<Author[]> => {
    const client = getClient();
    return client.getAuthors();
});

/**
 * Generate metadata for a post (for use in generateMetadata)
 *
 * @example
 * ```tsx
 * import { generatePostMetadata } from '@astracms/next';
 * import type { Metadata } from 'next';
 *
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   return generatePostMetadata(params.slug);
 * }
 * ```
 */
export async function generatePostMetadata(slug: string): Promise<{
    title: string;
    description: string;
    openGraph?: {
        title: string;
        description: string;
        images?: string[];
        type: "article";
        publishedTime?: string;
        modifiedTime?: string;
        authors?: string[];
    };
}> {
    const post = await getPost(slug);

    if (!post) {
        return {
            title: "Post Not Found",
            description: "",
        };
    }

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            images: post.coverImage ? [post.coverImage] : undefined,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: post.authors.map((a) => a.name),
        },
    };
}

/**
 * Generate static params for all posts (for use in generateStaticParams)
 *
 * @example
 * ```tsx
 * import { generatePostStaticParams } from '@astracms/next';
 *
 * export async function generateStaticParams() {
 *   return generatePostStaticParams();
 * }
 * ```
 */
export async function generatePostStaticParams(): Promise<
    Array<{ slug: string }>
> {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

/**
 * Generate static params for all categories
 */
export async function generateCategoryStaticParams(): Promise<
    Array<{ slug: string }>
> {
    const categories = await getCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
}

/**
 * Generate static params for all tags
 */
export async function generateTagStaticParams(): Promise<
    Array<{ slug: string }>
> {
    const tags = await getTags();
    return tags.map((tag) => ({ slug: tag.slug }));
}
