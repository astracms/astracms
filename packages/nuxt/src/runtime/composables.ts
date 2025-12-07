import {
  AstraCMSClient,
  type Author,
  type Category,
  type GetPostsOptions,
  type Post,
  type Tag,
} from "@astracms/core";
import { type Ref, ref, watch } from "vue";
import { useAsyncData, useRuntimeConfig } from "#imports";

/**
 * Get a configured AstraCMS client instance
 */
export function useAstraCMS(): AstraCMSClient {
  const config = useRuntimeConfig();
  const { apiKey, workspaceId, apiVersion } = config.public.astracms as {
    apiKey?: string;
    workspaceId?: string;
    apiVersion?: "v1" | "v2";
  };

  if (apiVersion === "v1" && workspaceId) {
    return new AstraCMSClient({ apiVersion: "v1", workspaceId });
  }

  if (!apiKey) {
    throw new Error("AstraCMS: apiKey is required for v2 API");
  }

  return new AstraCMSClient({ apiKey });
}

/**
 * Fetch posts with Nuxt's useFetch for SSR support
 *
 * @example
 * ```vue
 * <script setup>
 * const { data: posts, pending } = await usePosts();
 * </script>
 * ```
 */
export function usePosts(options: GetPostsOptions = {}) {
  const client = useAstraCMS();

  return useAsyncData(
    `astracms-posts-${JSON.stringify(options)}`,
    () => client.getPosts(options),
    { default: () => [] as Post[] }
  );
}

/**
 * Fetch a single post by slug
 *
 * @example
 * ```vue
 * <script setup>
 * const route = useRoute();
 * const { data: post, pending } = await usePost(route.params.slug);
 * </script>
 * ```
 */
export function usePost(
  slug: string | Ref<string>,
  options: { format?: "html" | "markdown" } = {}
) {
  const client = useAstraCMS();
  const getSlug = () => (typeof slug === "string" ? slug : slug.value);

  return useAsyncData(
    `astracms-post-${getSlug()}`,
    () => client.getPost(getSlug(), options),
    {
      default: () => null as Post | null,
      watch: typeof slug === "string" ? undefined : [slug],
    }
  );
}

/**
 * Fetch all categories
 */
export function useCategories() {
  const client = useAstraCMS();

  return useAsyncData("astracms-categories", () => client.getCategories(), {
    default: () => [] as Category[],
  });
}

/**
 * Fetch all tags
 */
export function useTags() {
  const client = useAstraCMS();

  return useAsyncData("astracms-tags", () => client.getTags(), {
    default: () => [] as Tag[],
  });
}

/**
 * Fetch all authors
 */
export function useAuthors() {
  const client = useAstraCMS();

  return useAsyncData("astracms-authors", () => client.getAuthors(), {
    default: () => [] as Author[],
  });
}

/**
 * Search posts with debouncing
 */
export function usePostSearch(
  query: Ref<string>,
  options: { debounceMs?: number } = {}
) {
  const { debounceMs = 300 } = options;
  const client = useAstraCMS();
  const debouncedQuery = ref(query.value);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(query, (newQuery: string) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debouncedQuery.value = newQuery;
    }, debounceMs);
  });

  return useAsyncData(
    () => `astracms-search-${debouncedQuery.value}`,
    async () => {
      if (!debouncedQuery.value.trim()) return [];
      return client.getPosts({ query: debouncedQuery.value });
    },
    {
      default: () => [] as Post[],
      watch: [debouncedQuery],
    }
  );
}
