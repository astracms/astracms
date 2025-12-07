/**
 * V2 Tags Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 * The workspaceId is extracted from the authenticated API key context.
 */

import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  ForbiddenResponseSchema,
  RateLimitResponseSchema,
  UnauthorizedResponseSchema,
} from "../../schemas/common";
import {
  TagQuerySchema,
  TagResponseSchema,
  TagsListResponseSchema,
  TagsQuerySchema,
} from "../../schemas/tags";
import type { Env, Variables } from "../../types/env";

const v2Tags = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// V2 List tags route - no workspaceId in path
const listTagsV2Route = createRoute({
  method: "get",
  path: "/",
  operationId: "listTagsV2",
  tags: ["Tags"],
  summary: "List tags",
  description: "Get a paginated list of tags with post counts",
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: TagsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagsListResponseSchema,
        },
      },
      description: "Successfully retrieved tags",
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

v2Tags.openapi(listTagsV2Route, async (c) => {
  const db = createClient(c.env.DATABASE_URL);
  const workspaceId = c.get("workspaceId");

  if (!workspaceId) {
    return c.json(
      { error: "Unauthorized" as const, message: "No workspace context found" },
      401
    );
  }

  const queryParams = c.req.valid("query");
  const limit = Number.parseInt(queryParams.limit, 10) || 10;
  const page = Number.parseInt(queryParams.page, 10) || 1;

  const totalTags = await db.tag.count({
    where: { workspaceId },
  });

  const totalPages = Math.ceil(totalTags / limit);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const tagsToSkip = limit ? (page - 1) * limit : 0;

  if (page > totalPages && totalTags > 0) {
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

  const tagsList = await db.tag.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          posts: {
            where: { status: "published" },
          },
        },
      },
    },
    take: limit,
    skip: tagsToSkip,
  });

  const transformedTags = tagsList.map((tag) => {
    const { _count, ...rest } = tag;
    return { ...rest, count: _count };
  });

  return c.json(
    {
      tags: transformedTags,
      pagination: {
        limit,
        currentPage: page,
        nextPage,
        previousPage: prevPage,
        totalPages,
        totalItems: totalTags,
      },
    },
    200
  );
});

// V2 Get single tag route
const TagIdentifierParamV2Schema = z.object({
  identifier: z.string().openapi({
    param: { name: "identifier", in: "path" },
    example: "javascript",
    description: "Tag slug or ID",
  }),
});

const getTagV2Route = createRoute({
  method: "get",
  path: "/{identifier}",
  operationId: "getTagV2",
  tags: ["Tags"],
  summary: "Get a single tag",
  description:
    "Get a single tag by slug or ID, optionally including related posts",
  security: [{ ApiKeyAuth: [] }],
  request: {
    params: TagIdentifierParamV2Schema,
    query: TagQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagResponseSchema,
        },
      },
      description: "Successfully retrieved tag",
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
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Tag not found",
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

v2Tags.openapi(getTagV2Route, async (c) => {
  try {
    const db = createClient(c.env.DATABASE_URL);
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
    const queryParams = c.req.valid("query");
    const limit = Number.parseInt(queryParams.limit, 10) || 10;
    const page = Number.parseInt(queryParams.page, 10) || 1;
    const include = queryParams.include
      ? queryParams.include
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const tag = await db.tag.findFirst({
      where: {
        workspaceId,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            posts: {
              where: { status: "published" },
            },
          },
        },
      },
    });

    if (!tag) {
      return c.json({ error: "Tag not found" }, 404);
    }

    const totalPosts = await db.post.count({
      where: {
        workspaceId,
        status: "published",
        tags: { some: { id: tag.id } },
      },
    });

    const totalPages = Math.ceil(totalPosts / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const postsToSkip = limit ? (page - 1) * limit : 0;

    if (page > totalPages && totalPosts > 0) {
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

    const { _count, ...rest } = tag;
    const transformedTag = { ...rest, count: _count };

    if (include.includes("posts")) {
      const posts = await db.post.findMany({
        where: {
          workspaceId,
          status: "published",
          tags: { some: { id: tag.id } },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: postsToSkip,
      });

      return c.json(
        {
          ...transformedTag,
          posts: {
            data: posts,
            pagination: {
              limit,
              currentPage: page,
              nextPage,
              previousPage: prevPage,
              totalPages,
              totalItems: totalPosts,
            },
          },
        },
        200
      );
    }

    return c.json(transformedTag, 200);
  } catch (error) {
    console.error("Error fetching tag:", error);
    return c.json({ error: "Failed to fetch tag" }, 500);
  }
});

export default v2Tags;
