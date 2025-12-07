import { z } from "@hono/zod-openapi";

// Base schemas
export const CategorySchema = z
  .object({
    id: z.string().openapi({ example: "clx2k4m6n8p0r2t4v6x8z" }),
    name: z.string().openapi({ example: "Technology" }),
    slug: z.string().openapi({ example: "technology" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Tech articles and news" }),
    count: z.object({
      posts: z.number().openapi({ example: 42 }),
    }),
  })
  .openapi("Category");

export const PostWithCategorySchema = z
  .object({
    id: z.string().openapi({ example: "clx4b6d8f0h2j4l6n8p0r" }),
    title: z.string().openapi({ example: "Getting Started with JavaScript" }),
    slug: z.string().openapi({ example: "getting-started-with-javascript" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Learn the basics of JavaScript" }),
    coverImage: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/cover.jpg" }),
    publishedAt: z
      .string()
      .datetime()
      .nullable()
      .openapi({ example: "2024-01-01T12:00:00Z" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-02T12:00:00Z" }),
    content: z
      .string()
      .nullable()
      .openapi({ example: "<p>Post content...</p>" }),
    authors: z.array(
      z.object({
        id: z.string().openapi({ example: "clx1a2b3c4d5e6f7g8h9i" }),
        name: z.string().openapi({ example: "John Doe" }),
        image: z
          .string()
          .nullable()
          .openapi({ example: "https://example.com/avatar.jpg" }),
      })
    ),
    tags: z.array(
      z.object({
        id: z.string().openapi({ example: "clx3y5a7c9e1g3i5k7m9o" }),
        name: z.string().openapi({ example: "JavaScript" }),
        slug: z.string().openapi({ example: "javascript" }),
      })
    ),
    category: z
      .object({
        id: z.string().openapi({ example: "clx2k4m6n8p0r2t4v6x8z" }),
        name: z.string().openapi({ example: "Technology" }),
        slug: z.string().openapi({ example: "technology" }),
      })
      .nullable(),
  })
  .openapi("PostWithCategory");

// Query parameters
export const CategoriesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("10")
    .openapi({
      param: { name: "limit", in: "query" },
      example: "10",
      description: "Number of categories per page",
    }),
  page: z
    .string()
    .optional()
    .default("1")
    .openapi({
      param: { name: "page", in: "query" },
      example: "1",
      description: "Page number for pagination",
    }),
  include: z
    .string()
    .optional()
    .openapi({
      param: { name: "include", in: "query" },
      example: "posts",
      description: "Related resources to include (e.g., posts)",
    }),
});

export const CategoryQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("10")
    .openapi({
      param: { name: "limit", in: "query" },
      example: "10",
      description: "Number of posts per page when including posts",
    }),
  page: z
    .string()
    .optional()
    .default("1")
    .openapi({
      param: { name: "page", in: "query" },
      example: "1",
      description: "Page number for pagination when including posts",
    }),
  include: z
    .string()
    .optional()
    .openapi({
      param: { name: "include", in: "query" },
      example: "posts",
      description: "Related resources to include (e.g., posts)",
    }),
});

// Response schemas
export const PaginationSchema = z
  .object({
    limit: z.number().openapi({ example: 10 }),
    currentPage: z.number().openapi({ example: 1 }),
    nextPage: z.number().nullable().openapi({ example: 2 }),
    previousPage: z.number().nullable().openapi({ example: null }),
    totalPages: z.number().openapi({ example: 5 }),
    totalItems: z.number().openapi({ example: 48 }),
  })
  .openapi("Pagination");

export const CategoriesListResponseSchema = z
  .object({
    categories: z.array(CategorySchema),
    pagination: PaginationSchema,
  })
  .openapi("CategoriesListResponse");

export const CategoryWithPostsSchema = z
  .object({
    id: z.string().openapi({ example: "clx2k4m6n8p0r2t4v6x8z" }),
    name: z.string().openapi({ example: "Technology" }),
    slug: z.string().openapi({ example: "technology" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Tech articles and news" }),
    count: z.object({
      posts: z.number().openapi({ example: 42 }),
    }),
    posts: z.object({
      data: z.array(PostWithCategorySchema),
      pagination: PaginationSchema,
    }),
  })
  .openapi("CategoryWithPosts");

export const CategoryResponseSchema = z
  .union([CategorySchema, CategoryWithPostsSchema])
  .openapi("CategoryResponse");

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.any().optional(),
    message: z.string().optional(),
  })
  .openapi("ErrorResponse");

// Path parameters
export const WorkspaceIdParamSchema = z.object({
  workspaceId: z.string().openapi({
    param: { name: "workspaceId", in: "path" },
    example: "my-workspace",
    description: "Workspace identifier",
  }),
});

export const CategoryIdentifierParamSchema = z.object({
  workspaceId: z.string().openapi({
    param: { name: "workspaceId", in: "path" },
    example: "my-workspace",
    description: "Workspace identifier",
  }),
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "technology",
    description: "Category slug or ID",
  }),
});
