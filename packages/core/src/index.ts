// Client
export { AstraCMSClient, createAstraCMSClient } from "./client";
export type {
  AuthorSchema,
  AuthorSocialSchema,
  CategorySchema,
  PostSchema,
  TagSchema,
} from "./schemas";

// Schemas
export {
  authorSchema,
  authorSocialSchema,
  authorsResponseSchema,
  categoriesResponseSchema,
  categorySchema,
  paginationSchema,
  postSchema,
  postsResponseSchema,
  tagSchema,
  tagsResponseSchema,
} from "./schemas";
// Types
export type {
  ApiVersion,
  AstraCMSConfig,
  Author,
  AuthorBase,
  AuthorSocial,
  AuthorsAPIResponse,
  CategoriesAPIResponse,
  Category,
  CategoryBase,
  GetPostsOptions,
  Pagination,
  Post,
  PostsAPIResponse,
  Tag,
  TagBase,
  TagsAPIResponse,
  V1Config,
  V2Config,
} from "./types";
