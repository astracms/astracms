import { z } from "@hono/zod-openapi";

// Base schemas
export const SocialSchema = z
  .object({
    url: z.string().openapi({ example: "https://twitter.com/johndoe" }),
    platform: z.string().openapi({ example: "twitter" }),
  })
  .openapi("Social");

export const AuthorSchema = z
  .object({
    id: z.string().openapi({ example: "clx1a2b3c4d5e6f7g8h9i" }),
    name: z.string().openapi({ example: "John Doe" }),
    image: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/avatar.jpg" }),
    slug: z.string().openapi({ example: "john-doe" }),
    bio: z
      .string()
      .nullable()
      .openapi({ example: "Tech writer and developer" }),
    role: z.string().nullable().openapi({ example: "Senior Developer" }),
    socials: z.array(SocialSchema),
    count: z.object({
      posts: z.number().openapi({ example: 25 }),
    }),
  })
  .openapi("Author");

export const AuthorWithoutCountSchema = z
  .object({
    id: z.string().openapi({ example: "clx1a2b3c4d5e6f7g8h9i" }),
    name: z.string().openapi({ example: "John Doe" }),
    image: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/avatar.jpg" }),
    slug: z.string().openapi({ example: "john-doe" }),
    bio: z
      .string()
      .nullable()
      .openapi({ example: "Tech writer and developer" }),
    role: z.string().nullable().openapi({ example: "Senior Developer" }),
    socials: z.array(SocialSchema),
  })
  .openapi("AuthorWithoutCount");

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
export const AuthorsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("10")
    .openapi({
      param: { name: "limit", in: "query" },
      example: "10",
      description: "Number of authors per page",
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

export const AuthorQuerySchema = z.object({
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

export const AuthorsListResponseSchema = z
  .object({
    authors: z.array(AuthorSchema),
    pagination: PaginationSchema,
  })
  .openapi("AuthorsListResponse");

export const AuthorWithPostsSchema = z
  .object({
    id: z.string().openapi({ example: "clx1a2b3c4d5e6f7g8h9i" }),
    name: z.string().openapi({ example: "John Doe" }),
    image: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/avatar.jpg" }),
    slug: z.string().openapi({ example: "john-doe" }),
    bio: z
      .string()
      .nullable()
      .openapi({ example: "Tech writer and developer" }),
    role: z.string().nullable().openapi({ example: "Senior Developer" }),
    socials: z.array(SocialSchema),
    posts: z.object({
      data: z.array(PostSummarySchema),
      pagination: PaginationSchema,
    }),
  })
  .openapi("AuthorWithPosts");

export const AuthorSingleResponseSchema = z
  .object({
    author: AuthorWithoutCountSchema,
  })
  .openapi("AuthorSingleResponse");

export const AuthorResponseSchema = z
  .union([AuthorWithPostsSchema, AuthorSingleResponseSchema])
  .openapi("AuthorResponse");

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

export const AuthorIdentifierParamSchema = z.object({
  workspaceId: z.string().openapi({
    param: { name: "workspaceId", in: "path" },
    example: "my-workspace",
    description: "Workspace identifier",
  }),
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "john-doe",
    description: "Author slug or ID",
  }),
});
