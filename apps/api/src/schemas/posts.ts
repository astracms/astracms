import { z } from "@hono/zod-openapi";

// Base schemas
export const AuthorSchema = z.object({
  id: z.string().openapi({ example: "clx1a2b3c4d5e6f7g8h9i" }),
  name: z.string().openapi({ example: "John Doe" }),
  image: z
    .string()
    .nullable()
    .openapi({ example: "https://example.com/avatar.jpg" }),
  bio: z.string().nullable().openapi({ example: "Tech writer and developer" }),
  role: z.string().nullable().openapi({ example: "Senior Developer" }),
  slug: z.string().openapi({ example: "john-doe" }),
  socials: z.array(
    z.object({
      url: z.string().openapi({ example: "https://twitter.com/johndoe" }),
      platform: z.string().openapi({ example: "twitter" }),
    })
  ),
});

export const CategorySchema = z.object({
  id: z.string().openapi({ example: "clx2k4m6n8p0r2t4v6x8z" }),
  name: z.string().openapi({ example: "Technology" }),
  slug: z.string().openapi({ example: "technology" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "Tech articles and news" }),
});

export const TagSchema = z.object({
  id: z.string().openapi({ example: "clx3y5a7c9e1g3i5k7m9o" }),
  name: z.string().openapi({ example: "JavaScript" }),
  slug: z.string().openapi({ example: "javascript" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "JavaScript programming" }),
});

export const PostSchema = z
  .object({
    id: z.string().openapi({ example: "clx4b6d8f0h2j4l6n8p0r" }),
    slug: z.string().openapi({ example: "my-first-post" }),
    title: z.string().openapi({ example: "My First Blog Post" }),
    content: z.string().nullable().openapi({
      example: "<p>This is the content of my first blog post.</p>",
      description: "HTML or Markdown content depending on format parameter",
    }),
    featured: z.boolean().openapi({ example: true }),
    coverImage: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/cover.jpg" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "A brief description of the post" }),
    publishedAt: z
      .string()
      .datetime()
      .nullable()
      .openapi({ example: "2024-01-01T12:00:00Z" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-02T12:00:00Z" }),
    attribution: z
      .string()
      .nullable()
      .openapi({ example: "Originally published on Medium" }),
    authors: z.array(AuthorSchema),
    category: CategorySchema.nullable(),
    tags: z.array(TagSchema),
  })
  .openapi("Post");

// Query parameters
export const PostsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("10")
    .openapi({
      param: { name: "limit", in: "query" },
      example: "10",
      description: "Number of posts per page or 'all' for no pagination",
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
  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .openapi({
      param: { name: "order", in: "query" },
      example: "desc",
      description: "Sort order by published date",
    }),
  categories: z
    .string()
    .optional()
    .openapi({
      param: { name: "categories", in: "query" },
      example: "technology,science",
      description: "Comma-separated category slugs to filter by",
    }),
  excludeCategories: z
    .string()
    .optional()
    .openapi({
      param: { name: "excludeCategories", in: "query" },
      example: "politics,sports",
      description: "Comma-separated category slugs to exclude",
    }),
  tags: z
    .string()
    .optional()
    .openapi({
      param: { name: "tags", in: "query" },
      example: "javascript,typescript",
      description: "Comma-separated tag slugs to filter by",
    }),
  excludeTags: z
    .string()
    .optional()
    .openapi({
      param: { name: "excludeTags", in: "query" },
      example: "deprecated,archived",
      description: "Comma-separated tag slugs to exclude",
    }),
  query: z
    .string()
    .optional()
    .openapi({
      param: { name: "query", in: "query" },
      example: "search term",
      description: "Search query to filter posts by title or content",
    }),
  format: z
    .enum(["html", "markdown"])
    .optional()
    .openapi({
      param: { name: "format", in: "query" },
      example: "html",
      description: "Content format (html or markdown)",
    }),
});

// Response schemas
export const PaginationSchema = z
  .object({
    limit: z.union([z.number(), z.literal("all")]).openapi({ example: 10 }),
    currentPage: z.number().openapi({ example: 1 }),
    nextPage: z.number().nullable().openapi({ example: 2 }),
    previousPage: z.number().nullable().openapi({ example: null }),
    totalPages: z.number().openapi({ example: 5 }),
    totalItems: z.number().openapi({ example: 48 }),
  })
  .openapi("Pagination");

export const PostsListResponseSchema = z
  .object({
    posts: z.array(PostSchema),
    pagination: PaginationSchema,
  })
  .openapi("PostsListResponse");

export const PostResponseSchema = z
  .object({
    post: PostSchema,
  })
  .openapi("PostResponse");

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

export const PostIdentifierParamSchema = z.object({
  workspaceId: z.string().openapi({
    param: { name: "workspaceId", in: "path" },
    example: "my-workspace",
    description: "Workspace identifier",
  }),
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "my-first-post",
    description: "Post slug or ID",
  }),
});

export const PostFormatQuerySchema = z.object({
  format: z
    .enum(["html", "markdown"])
    .optional()
    .openapi({
      param: { name: "format", in: "query" },
      example: "html",
      description: "Content format (html or markdown)",
    }),
});
