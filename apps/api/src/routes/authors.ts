import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  AuthorIdentifierParamSchema,
  AuthorQuerySchema,
  AuthorResponseSchema,
  AuthorsListResponseSchema,
  AuthorsQuerySchema,
  ErrorResponseSchema,
  WorkspaceIdParamSchema,
} from "../schemas/authors";
import type { Env, Variables } from "../types/env";

const authors = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// List authors route
const listAuthorsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Authors"],
  summary: "List authors",
  description: "Get a paginated list of authors with post counts",
  request: {
    params: WorkspaceIdParamSchema,
    query: AuthorsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthorsListResponseSchema,
        },
      },
      description: "Successfully retrieved authors",
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

authors.openapi(listAuthorsRoute, async (c) => {
  const url = c.env.DATABASE_URL;
  const { workspaceId } = c.req.valid("param");
  const queryParams = c.req.valid("query");

  // Transform query parameters
  const limit = Number.parseInt(queryParams.limit, 10) || 10;
  const page = Number.parseInt(queryParams.page, 10) || 1;
  const db = createClient(url);

  const totalAuthors = await db.author.count({
    where: {
      workspaceId,
      coAuthoredPosts: {
        some: {
          status: "published",
        },
      },
    },
  });

  const totalPages = Math.ceil(totalAuthors / limit);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const authorsToSkip = limit ? (page - 1) * limit : 0;

  if (page > totalPages && totalAuthors > 0) {
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

  try {
    const authorsList = await db.author.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
        slug: true,
        bio: true,
        role: true,
        socials: {
          select: {
            url: true,
            platform: true,
          },
        },
        _count: {
          select: {
            coAuthoredPosts: {
              where: {
                status: "published",
              },
            },
          },
        },
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: authorsToSkip,
    });

    // because I dont want prisma's ugly _count
    const transformedAuthors = authorsList.map((author) => {
      const { _count, ...rest } = author;
      return {
        ...rest,
        count: {
          posts: _count.coAuthoredPosts,
        },
      };
    });

    return c.json(
      {
        authors: transformedAuthors,
        pagination: {
          limit,
          currentPage: page,
          nextPage,
          previousPage: prevPage,
          totalPages,
          totalItems: totalAuthors,
        },
      },
      200
    );
  } catch (_error) {
    return c.json({ error: "Failed to fetch authors" }, 500);
  }
});

// Get single author route
const getAuthorRoute = createRoute({
  method: "get",
  path: "/{identifier}",
  tags: ["Authors"],
  summary: "Get a single author",
  description:
    "Get a single author by slug or ID, optionally including related posts",
  request: {
    params: AuthorIdentifierParamSchema,
    query: AuthorQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthorResponseSchema,
        },
      },
      description: "Successfully retrieved author",
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
      description: "Author not found",
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

authors.openapi(getAuthorRoute, async (c) => {
  const url = c.env.DATABASE_URL;
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
  const db = createClient(url);

  try {
    const author = await db.author.findFirst({
      where: {
        workspaceId,
        isActive: true,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      select: {
        id: true,
        name: true,
        image: true,
        slug: true,
        bio: true,
        role: true,
        socials: {
          select: {
            url: true,
            platform: true,
          },
        },
      },
    });

    if (!author) {
      return c.json({ error: "Author not found" }, 404);
    }

    const totalPosts = await db.post.count({
      where: {
        workspaceId,
        status: "published",
        authors: {
          some: {
            id: author.id,
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

    if (include.includes("posts")) {
      const posts = await db.post.findMany({
        where: {
          workspaceId,
          status: "published",
          authors: {
            some: {
              id: author.id,
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

      return c.json(
        {
          ...author,
          posts: {
            data: posts.map((post) => ({
              ...post,
              publishedAt: post.publishedAt?.toISOString() ?? null,
            })),
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

    return c.json({ author }, 200);
  } catch (_error) {
    return c.json({ error: "Failed to fetch author" }, 500);
  }
});

export default authors;
