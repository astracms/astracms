import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  TagIdentifierParamSchema,
  TagQuerySchema,
  TagResponseSchema,
  TagsListResponseSchema,
  TagsQuerySchema,
  WorkspaceIdParamSchema,
} from "../schemas/tags";
import type { Env, Variables } from "../types/env";

const tags = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// List tags route
const listTagsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tags"],
  summary: "List tags",
  description: "Get a paginated list of tags with post counts",
  request: {
    params: WorkspaceIdParamSchema,
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

tags.openapi(listTagsRoute, async (c) => {
  const db = createClient(c.env.DATABASE_URL);
  const { workspaceId } = c.req.valid("param");
  const queryParams = c.req.valid("query");

  // Transform query parameters
  const limit = Number.parseInt(queryParams.limit, 10) || 10;
  const page = Number.parseInt(queryParams.page, 10) || 1;

  const totalTags = await db.tag.count({
    where: {
      workspaceId,
    },
  });

  const totalPages = Math.ceil(totalTags / limit);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const tagsToSkip = limit ? (page - 1) * limit : 0;

  // Validate page number
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
    where: {
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          posts: {
            where: {
              status: "published",
            },
          },
        },
      },
    },
    take: limit,
    skip: tagsToSkip,
  });

  // because I dont want prisma's ugly _count
  const transformedTags = tagsList.map((tag) => {
    const { _count, ...rest } = tag;
    return {
      ...rest,
      count: _count,
    };
  });

  return c.json({
    tags: transformedTags,
    pagination: {
      limit,
      currentPage: page,
      nextPage,
      previousPage: prevPage,
      totalPages,
      totalItems: totalTags,
    },
  }, 200);
});

// Get single tag route
const getTagRoute = createRoute({
  method: "get",
  path: "/{identifier}",
  tags: ["Tags"],
  summary: "Get a single tag",
  description:
    "Get a single tag by slug or ID, optionally including related posts",
  request: {
    params: TagIdentifierParamSchema,
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
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Tag not found",
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

tags.openapi(getTagRoute, async (c) => {
  try {
    const db = createClient(c.env.DATABASE_URL);
    const { workspaceId, identifier } = c.req.valid("param");
    const queryParams = c.req.valid("query");

    // Transform query parameters
    const limit = Number.parseInt(queryParams.limit, 10) || 10;
    const page = Number.parseInt(queryParams.page, 10) || 1;
    const include = queryParams.include
      ? queryParams.include
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // First get the tag
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
              where: {
                status: "published",
              },
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
        tags: {
          some: {
            id: tag.id,
          },
        },
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

    // Transform _count to count
    const { _count, ...rest } = tag;
    const transformedTag = {
      ...rest,
      count: _count,
    };

    if (include.includes("posts")) {
      const posts = await db.post.findMany({
        where: {
          workspaceId,
          status: "published",
          tags: {
            some: {
              id: tag.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
        skip: postsToSkip,
      });
      return c.json({
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
      }, 200);
    }

    return c.json(transformedTag, 200);
  } catch (error) {
    console.error("Error fetching tag:", error);
    return c.json({ error: "Failed to fetch tag" }, 500);
  }
});

export default tags;
