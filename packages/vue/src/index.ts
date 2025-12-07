// Plugin

// Re-export types from core
export type {
  AstraCMSConfig,
  Author,
  AuthorSocial,
  Category,
  GetPostsOptions,
  Post,
  Tag,
} from "@astracms/core";

// Composables
export {
  useAuthors,
  useCategories,
  usePost,
  usePosts,
  useSearch,
  useTags,
} from "./composables";
export {
  createAstraCMSPlugin,
  provideAstraCMS,
  useAstraCMSClient,
} from "./plugin";
