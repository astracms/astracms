export type { AuthorsLoaderOptions } from "./loaders/authors";
export { authorsLoader } from "./loaders/authors";
export type { CategoriesLoaderOptions } from "./loaders/categories";
export { categoriesLoader } from "./loaders/categories";

export type { PostsLoaderOptions } from "./loaders/posts";
export { postsLoader } from "./loaders/posts";
export type { TagsLoaderOptions } from "./loaders/tags";
export { tagsLoader } from "./loaders/tags";

export {
    authorEntrySchema,
    authorSchema,
    authorSocialSchema,
    categoryEntrySchema,
    categorySchema,
    postSchema,
    tagEntrySchema,
    tagSchema,
} from "./schemas";

export type {
    AstraCMSConfig,
    Author,
    AuthorSocial,
    AuthorsAPIResponse,
    CategoriesAPIResponse,
    Category,
    Post,
    PostsAPIResponse,
    Tag,
    TagsAPIResponse,
} from "./types";
