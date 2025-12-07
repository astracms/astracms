/**
 * V2 Posts Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 */

import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { NodeHtmlMarkdown } from "node-html-markdown";
import {
  ErrorResponseSchema,
  ForbiddenResponseSchema,
  RateLimitResponseSchema,
  UnauthorizedResponseSchema,
} from "../../schemas/common";
import {
  PostFormatQuerySchema,
  PostResponseSchema,
  PostsListResponseSchema,
  PostsQuerySchema,
} from "../../schemas/posts";
import type { Env, Variables } from "../../types/env";

const v2Posts = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// V2 List posts route
const listPostsV2Route = createRoute({
  method: "get",
  path: "/",
  operationId: "listPostsV2",
  tags: ["Posts"],
  summary: "List posts",
  description:
    "Get a paginated list of published posts with filtering and search capabilities",
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: PostsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PostsListResponseSchema,
        },
      },
      description: "Successfully retrieved posts",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid query parameters or page number",
    },
    401: {
      content: {
        "application/json": {
          schema: UnauthorizedResponseSchema,
        },
      },
      description: "Missing or invalid API key",
    },
    403: {
      content: {
        "application/json": {
          schema: ForbiddenResponseSchema,
        },
      },
      description: "Insufficient permissions",
    },
    429: {
      content: {
        "application/json": {
          schema: RateLimitResponseSchema,
        },
      },
      description: "Rate limit exceeded",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

v2Posts.openapi(listPostsV2Route, async (c) => {
  try {
    const workspaceId = c.get("workspaceId");
    if (!workspaceId) {
      return c.json(
        {
          error: "Unauthorized" as const,
          message: "No workspace context found",
        },
        401
      );
    }

    const queryParams = c.req.valid("query");
    const rawLimit =
      queryParams.limit === "all"
        ? "all"
        : Number.parseInt(queryParams.limit, 10) || 10;
    const page = Number.parseInt(queryParams.page, 10) || 1;
    const order = queryParams.order || "desc";
    const categories = queryParams.categories
      ? queryParams.categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const excludeCategories = queryParams.excludeCategories
      ? queryParams.excludeCategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const tags = queryParams.tags
      ? queryParams.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const excludeTags = queryParams.excludeTags
      ? queryParams.excludeTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const query = queryParams.query;
    const format = queryParams.format;

    const db = createClient(c.env.DATABASE_URL);

    const where = {
      workspaceId,
      status: "published" as const,
      ...(() => {
        const categoryFilter: Record<string, string[]> = {};
        if (categories.length > 0) categoryFilter.in = categories;
        if (excludeCategories.length > 0)
          categoryFilter.notIn = excludeCategories;
        if (Object.keys(categoryFilter).length > 0) {
          return { category: { slug: categoryFilter } };
        }
        return {};
      })(),
      ...(() => {
        const tagFilter: Record<string, unknown> = {};
        if (tags.length > 0) tagFilter.some = { slug: { in: tags } };
        if (excludeTags.length > 0)
          tagFilter.none = { slug: { in: excludeTags } };
        if (Object.keys(tagFilter).length > 0) {
          return { tags: tagFilter };
        }
        return {};
      })(),
      ...(query && {
        OR: [{ title: { contains: query } }, { content: { contains: query } }],
      }),
    };

    const totalPosts = await db.post.count({ where });
    const limit = rawLimit === "all" ? undefined : rawLimit;
    const totalPages = limit ? Math.ceil(totalPosts / limit) : 1;

    if (limit && page > totalPages && totalPosts > 0) {
      return c.json(
        {
          error: "Invalid page number",
          details: {
            message: `Page ${page} does not exist.`,
            totalPages,
            requestedPage: page,
          },
        },
        400
      );
    }

    const postsToSkip = limit ? (page - 1) * limit : 0;
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    const postsData = await db.post.findMany({
      where,
      orderBy: { publishedAt: order },
      take: limit,
      skip: postsToSkip,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        featured: true,
        coverImage: true,
        description: true,
        publishedAt: true,
        updatedAt: true,
        attribution: true,
        authors: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            slug: true,
            socials: { select: { url: true, platform: true } },
          },
        },
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
        tags: {
          select: { id: true, name: true, slug: true, description: true },
        },
      },
    });

    const formattedPosts = postsData.map((post) => ({
      ...post,
      content:
        format === "markdown"
          ? NodeHtmlMarkdown.translate(post.content || "")
          : post.content,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      updatedAt: post.updatedAt.toISOString(),
      attribution:
        typeof post.attribution === "string" ? post.attribution : null,
    }));

    const paginationInfo = limit
      ? {
          limit,
          currentPage: page,
          nextPage,
          previousPage: prevPage,
          totalPages,
          totalItems: totalPosts,
        }
      : {
          limit: totalPosts,
          currentPage: 1,
          nextPage: null,
          previousPage: null,
          totalPages: 1,
          totalItems: totalPosts,
        };

    return c.json({ posts: formattedPosts, pagination: paginationInfo }, 200);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json(
      {
        error: "Failed to fetch posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// V2 Get single post route
const PostIdentifierParamV2Schema = z.object({
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "my-first-post",
    description: "Post slug or ID",
  }),
});

const getPostV2Route = createRoute({
  method: "get",
  path: "/{identifier}",
  operationId: "getPostV2",
  tags: ["Posts"],
  summary: "Get a single post",
  description: "Get a single post by slug or ID",
  security: [{ ApiKeyAuth: [] }],
  request: {
    params: PostIdentifierParamV2Schema,
    query: PostFormatQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PostResponseSchema,
        },
      },
      description: "Successfully retrieved post",
    },
    401: {
      content: {
        "application/json": {
          schema: UnauthorizedResponseSchema,
        },
      },
      description: "Missing or invalid API key",
    },
    403: {
      content: {
        "application/json": {
          schema: ForbiddenResponseSchema,
        },
      },
      description: "Insufficient permissions",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Post not found",
    },
    429: {
      content: {
        "application/json": {
          schema: RateLimitResponseSchema,
        },
      },
      description: "Rate limit exceeded",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

v2Posts.openapi(getPostV2Route, async (c) => {
  try {
    const workspaceId = c.get("workspaceId");
    if (!workspaceId) {
      return c.json(
        {
          error: "Unauthorized" as const,
          message: "No workspace context found",
        },
        401
      );
    }

    const { identifier } = c.req.valid("param");
    const { format } = c.req.valid("query");
    const db = createClient(c.env.DATABASE_URL);

    const post = await db.post.findFirst({
      where: {
        workspaceId,
        OR: [{ slug: identifier }, { id: identifier }],
        status: "published",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        featured: true,
        coverImage: true,
        description: true,
        publishedAt: true,
        updatedAt: true,
        attribution: true,
        authors: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            slug: true,
            socials: { select: { url: true, platform: true } },
          },
        },
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
        tags: {
          select: { id: true, name: true, slug: true, description: true },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    const formattedPost = {
      ...post,
      content:
        format === "markdown"
          ? NodeHtmlMarkdown.translate(post.content || "")
          : post.content,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      updatedAt: post.updatedAt.toISOString(),
      attribution:
        typeof post.attribution === "string" ? post.attribution : null,
    };

    return c.json({ post: formattedPost }, 200);
  } catch (_error) {
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

export default v2Posts;
