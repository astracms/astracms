import type {
    Author,
    Category,
    GetPostsOptions,
    Post,
    Tag,
} from "@astracms/core";
import { type Ref, ref, watch } from "vue";
import { useAstraCMSClient } from "./plugin";

interface UseAsyncResult<T> {
    data: Ref<T | null>;
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    refetch: () => Promise<void>;
}

/**
 * Composable to fetch posts from AstraCMS
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePosts } from '@astracms/vue';
 *
 * const { data: posts, loading, error } = usePosts();
 *
 * // With filters
 * const { data: techPosts } = usePosts({
 *   categories: ['technology'],
 * });
 * </script>
 * ```
 */
export function usePosts(
    options: GetPostsOptions = {}
): UseAsyncResult<Post[]> {
    const client = useAstraCMSClient();
    const data = ref<Post[] | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);

    const fetch = async () => {
        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getPosts(options);
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    fetch();

    return { data, loading, error, refetch: fetch };
}

/**
 * Composable to fetch a single post by slug
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePost } from '@astracms/vue';
 *
 * const props = defineProps<{ slug: string }>();
 * const { data: post, loading } = usePost(() => props.slug);
 * </script>
 * ```
 */
export function usePost(
    slug: string | (() => string),
    options: { format?: "html" | "markdown" } = {}
): UseAsyncResult<Post> {
    const client = useAstraCMSClient();
    const data = ref<Post | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);

    const getSlug = () => (typeof slug === "function" ? slug() : slug);

    const fetch = async () => {
        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getPost(getSlug(), options);
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    // Watch for slug changes if it's a getter
    if (typeof slug === "function") {
        watch(slug, fetch, { immediate: true });
    } else {
        fetch();
    }

    return { data, loading, error, refetch: fetch };
}

/**
 * Composable to fetch all categories
 */
export function useCategories(): UseAsyncResult<Category[]> {
    const client = useAstraCMSClient();
    const data = ref<Category[] | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);

    const fetch = async () => {
        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getCategories();
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    fetch();

    return { data, loading, error, refetch: fetch };
}

/**
 * Composable to fetch all tags
 */
export function useTags(): UseAsyncResult<Tag[]> {
    const client = useAstraCMSClient();
    const data = ref<Tag[] | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);

    const fetch = async () => {
        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getTags();
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    fetch();

    return { data, loading, error, refetch: fetch };
}

/**
 * Composable to fetch all authors
 */
export function useAuthors(): UseAsyncResult<Author[]> {
    const client = useAstraCMSClient();
    const data = ref<Author[] | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);

    const fetch = async () => {
        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getAuthors();
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    fetch();

    return { data, loading, error, refetch: fetch };
}

/**
 * Composable to search posts with debouncing
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useSearch } from '@astracms/vue';
 *
 * const query = ref('');
 * const { data: results, loading } = useSearch(query);
 * </script>
 * ```
 */
export function useSearch(
    query: Ref<string> | string,
    options: { debounceMs?: number } = {}
): UseAsyncResult<Post[]> {
    const { debounceMs = 300 } = options;
    const client = useAstraCMSClient();
    const data = ref<Post[] | null>(null);
    const loading = ref(false);
    const error = ref<Error | null>(null);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const getQuery = () => (typeof query === "string" ? query : query.value);

    const fetch = async () => {
        const q = getQuery();
        if (!q.trim()) {
            data.value = [];
            return;
        }

        loading.value = true;
        error.value = null;
        try {
            data.value = await client.getPosts({ query: q });
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err));
        } finally {
            loading.value = false;
        }
    };

    const debouncedFetch = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(fetch, debounceMs);
    };

    if (typeof query !== "string") {
        watch(query, debouncedFetch, { immediate: true });
    } else {
        fetch();
    }

    return { data, loading, error, refetch: fetch };
}
