import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createClient } from "@astra/db";
import { NodeHtmlMarkdown } from "node-html-markdown";
import type { Env } from "../types/env";
import {
  PostsQuerySchema,
  PostsListResponseSchema,
  PostResponseSchema,
  ErrorResponseSchema,
  WorkspaceIdParamSchema,
  PostIdentifierParamSchema,
  PostFormatQuerySchema,
} from "../schemas/posts";

const posts = new OpenAPIHono<{ Bindings: Env }>();

// List posts route
const listPostsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Posts"],
  summary: "List posts",
  description:
    "Get a paginated list of published posts with filtering and search capabilities",
  request: {
    params: WorkspaceIdParamSchema,
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

posts.openapi(listPostsRoute, async (c) => {
  try {
    const url = c.env.DATABASE_URL;
    const { workspaceId } = c.req.valid("param");
    const queryParams = c.req.valid("query");

    // Transform query parameters
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

    const db = createClient(url);

    // Build the where clause
    const where = {
      workspaceId,
      status: "published" as const,
      ...(() => {
        const categoryFilter: Record<string, string[]> = {};
        if (categories.length > 0) {
          categoryFilter.in = categories;
        }
        if (excludeCategories.length > 0) {
          categoryFilter.notIn = excludeCategories;
        }
        if (Object.keys(categoryFilter).length > 0) {
          return { category: { slug: categoryFilter } };
        }
        return {};
      })(),
      ...(() => {
        const tagFilter: Record<string, unknown> = {};
        if (tags.length > 0) {
          tagFilter.some = { slug: { in: tags } };
        }
        if (excludeTags.length > 0) {
          tagFilter.none = { slug: { in: excludeTags } };
        }
        if (Object.keys(tagFilter).length > 0) {
          return { tags: tagFilter };
        }
        return {};
      })(),
      ...(query && {
        OR: [{ title: { contains: query } }, { content: { contains: query } }],
      }),
    };

    // Get total count for pagination
    const totalPosts = await db.post.count({ where });

    // Handle pagination
    const limit = rawLimit === "all" ? undefined : rawLimit;
    const totalPages = limit ? Math.ceil(totalPosts / limit) : 1;

    // Validate page number if pagination is enabled
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
        400,
      );
    }

    // Infer some additional stuff
    const postsToSkip = limit ? (page - 1) * limit : 0;
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    const postsData = await db.post.findMany({
      where,
      orderBy: {
        publishedAt: order,
      },
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
            socials: {
              select: {
                url: true,
                platform: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    // Format posts based on requested format
    const formattedPosts =
      format === "markdown"
        ? postsData.map((post) => ({
            ...post,
            content: NodeHtmlMarkdown.translate(post.content || ""),
          }))
        : postsData;

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

    return c.json({
      posts: formattedPosts,
      pagination: paginationInfo,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json(
      {
        error: "Failed to fetch posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Get single post route
const getPostRoute = createRoute({
  method: "get",
  path: "/{identifier}",
  tags: ["Posts"],
  summary: "Get a single post",
  description: "Get a single post by slug or ID",
  request: {
    params: PostIdentifierParamSchema,
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
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Post not found",
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

posts.openapi(getPostRoute, async (c) => {
  try {
    const url = c.env.DATABASE_URL;
    const { workspaceId, identifier } = c.req.valid("param");
    const { format } = c.req.valid("query");
    const db = createClient(url);

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
            socials: {
              select: {
                url: true,
                platform: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Format post based on requested format
    const formattedPost =
      format === "markdown"
        ? { ...post, content: NodeHtmlMarkdown.translate(post.content || "") }
        : post;

    return c.json({ post: formattedPost });
  } catch (_error) {
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

export default posts;
