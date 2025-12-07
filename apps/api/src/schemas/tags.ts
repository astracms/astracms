import { z } from "@hono/zod-openapi";

// Base schemas
export const TagSchema = z
  .object({
    id: z.string().openapi({ example: "clx3y5a7c9e1g3i5k7m9o" }),
    name: z.string().openapi({ example: "JavaScript" }),
    slug: z.string().openapi({ example: "javascript" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "JavaScript programming" }),
    count: z.object({
      posts: z.number().openapi({ example: 42 }),
    }),
  })
  .openapi("Tag");

export const TagWithoutCountSchema = z
  .object({
    id: z.string().openapi({ example: "clx3y5a7c9e1g3i5k7m9o" }),
    name: z.string().openapi({ example: "JavaScript" }),
    slug: z.string().openapi({ example: "javascript" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "JavaScript programming" }),
  })
  .openapi("TagWithoutCount");

export const PostSummarySchema = z
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
  })
  .openapi("PostSummary");

// Query parameters
export const TagsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("10")
    .openapi({
      param: { name: "limit", in: "query" },
      example: "10",
      description: "Number of tags per page",
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

export const TagQuerySchema = z.object({
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

export const TagsListResponseSchema = z
  .object({
    tags: z.array(TagSchema),
    pagination: PaginationSchema,
  })
  .openapi("TagsListResponse");

export const TagWithPostsSchema = z
  .object({
    id: z.string().openapi({ example: "clx3y5a7c9e1g3i5k7m9o" }),
    name: z.string().openapi({ example: "JavaScript" }),
    slug: z.string().openapi({ example: "javascript" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "JavaScript programming" }),
    count: z.object({
      posts: z.number().openapi({ example: 42 }),
    }),
    posts: z.object({
      data: z.array(PostSummarySchema),
      pagination: PaginationSchema,
    }),
  })
  .openapi("TagWithPosts");

export const TagResponseSchema = z
  .union([TagSchema, TagWithPostsSchema])
  .openapi("TagResponse");

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

export const TagIdentifierParamSchema = z.object({
  workspaceId: z.string().openapi({
    param: { name: "workspaceId", in: "path" },
    example: "my-workspace",
    description: "Workspace identifier",
  }),
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "javascript",
    description: "Tag slug or ID",
  }),
});
