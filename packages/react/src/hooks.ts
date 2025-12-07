"use client";

import type {
    Author,
    Category,
    GetPostsOptions,
    Post,
    Tag,
} from "@astracms/core";
import { useCallback, useEffect, useState } from "react";
import { useAstraCMSClient } from "./provider";

interface UseAsyncResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch posts from AstraCMS
 *
 * @example
 * ```tsx
 * const { data: posts, loading, error } = usePosts();
 *
 * // With filters
 * const { data: techPosts } = usePosts({
 *   categories: ['technology'],
 *   format: 'html',
 * });
 * ```
 */
export function usePosts(
    options: GetPostsOptions = {}
): UseAsyncResult<Post[]> {
    const client = useAstraCMSClient();
    const [data, setData] = useState<Post[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const posts = await client.getPosts(options);
            setData(posts);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client, JSON.stringify(options)]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook to fetch a single post by slug
 *
 * @example
 * ```tsx
 * const { data: post, loading } = usePost('my-post-slug');
 * ```
 */
export function usePost(
    slug: string,
    options: { format?: "html" | "markdown" } = {}
): UseAsyncResult<Post> {
    const client = useAstraCMSClient();
    const [data, setData] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const post = await client.getPost(slug, options);
            setData(post);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client, slug, options.format]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook to fetch all categories
 *
 * @example
 * ```tsx
 * const { data: categories, loading } = useCategories();
 * ```
 */
export function useCategories(): UseAsyncResult<Category[]> {
    const client = useAstraCMSClient();
    const [data, setData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const categories = await client.getCategories();
            setData(categories);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook to fetch all tags
 *
 * @example
 * ```tsx
 * const { data: tags, loading } = useTags();
 * ```
 */
export function useTags(): UseAsyncResult<Tag[]> {
    const client = useAstraCMSClient();
    const [data, setData] = useState<Tag[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tags = await client.getTags();
            setData(tags);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook to fetch all authors
 *
 * @example
 * ```tsx
 * const { data: authors, loading } = useAuthors();
 * ```
 */
export function useAuthors(): UseAsyncResult<Author[]> {
    const client = useAstraCMSClient();
    const [data, setData] = useState<Author[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const authors = await client.getAuthors();
            setData(authors);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook to search posts with debouncing
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const { data: results, loading } = useSearch(query);
 * ```
 */
export function useSearch(
    query: string,
    options: { debounceMs?: number } = {}
): UseAsyncResult<Post[]> {
    const { debounceMs = 300 } = options;
    const client = useAstraCMSClient();
    const [data, setData] = useState<Post[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        if (!query.trim()) {
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const posts = await client.getPosts({ query });
            setData(posts);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [client, query]);

    useEffect(() => {
        const timer = setTimeout(fetch, debounceMs);
        return () => clearTimeout(timer);
    }, [fetch, debounceMs]);

    return { data, loading, error, refetch: fetch };
}
