// Provider

// Re-export types from core for convenience
export type {
    AstraCMSConfig,
    Author,
    AuthorSocial,
    Category,
    GetPostsOptions,
    Post,
    Tag,
} from "@astracms/core";
// Hooks
export {
    useAuthors,
    useCategories,
    usePost,
    usePosts,
    useSearch,
    useTags,
} from "./hooks";
export type { AstraCMSProviderProps } from "./provider";
export { AstraCMSProvider, useAstraCMS, useAstraCMSClient } from "./provider";
