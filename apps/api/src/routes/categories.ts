import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createClient } from "@astra/db";
import type { Env } from "../types/env";
import {
  CategoriesQuerySchema,
  CategoryQuerySchema,
  CategoriesListResponseSchema,
  CategoryResponseSchema,
  ErrorResponseSchema,
  WorkspaceIdParamSchema,
  CategoryIdentifierParamSchema,
} from "../schemas/categories";

const categories = new OpenAPIHono<{ Bindings: Env }>();

// List categories route
const listCategoriesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List categories",
  description: "Get a paginated list of categories with post counts",
  request: {
    params: WorkspaceIdParamSchema,
    query: CategoriesQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CategoriesListResponseSchema,
        },
      },
      description: "Successfully retrieved categories",
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

categories.openapi(listCategoriesRoute, async (c) => {
  try {
    const url = c.env.DATABASE_URL;
    const { workspaceId } = c.req.valid("param");
    const queryParams = c.req.valid("query");

    // Transform query parameters
    const limit = Number.parseInt(queryParams.limit, 10) || 10;
    const page = Number.parseInt(queryParams.page, 10) || 1;
    const db = createClient(url);

    // Get total count
    const totalCategories = await db.category.count({
      where: { workspaceId },
    });

    const totalPages = Math.ceil(totalCategories / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const categoriesToSkip = limit ? (page - 1) * limit : 0;

    // Validate page number
    if (page > totalPages && totalCategories > 0) {
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

    const categoriesList = await db.category.findMany({
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
      skip: categoriesToSkip,
    });

    const transformedCategories = categoriesList.map((category) => {
      const { _count, ...rest } = category;
      return {
        ...rest,
        count: _count,
      };
    });

    return c.json({
      categories: transformedCategories,
      pagination: {
        limit,
        currentPage: page,
        nextPage,
        previousPage: prevPage,
        totalPages,
        totalItems: totalCategories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Get single category route
const getCategoryRoute = createRoute({
  method: "get",
  path: "/{identifier}",
  tags: ["Categories"],
  summary: "Get a single category",
  description:
    "Get a single category by slug or ID, optionally including related posts",
  request: {
    params: CategoryIdentifierParamSchema,
    query: CategoryQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CategoryResponseSchema,
        },
      },
      description: "Successfully retrieved category",
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
      description: "Category not found",
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

categories.openapi(getCategoryRoute, async (c) => {
  try {
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

    const category = await db.category.findFirst({
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

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }

    const totalPosts = await db.post.count({
      where: {
        workspaceId,
        status: "published",
        categoryId: category.id,
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
        400,
      );
    }

    // Transform _count to count
    const { _count, ...rest } = category;
    const transformedCategory = {
      ...rest,
      count: _count,
    };

    if (include.includes("posts")) {
      const posts = await db.post.findMany({
        where: {
          workspaceId,
          status: "published",
          categoryId: category.id,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          publishedAt: true,
          updatedAt: true,
          content: true,
          authors: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: limit,
        skip: postsToSkip,
      });

      return c.json({
        ...transformedCategory,
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
      });
    }

    return c.json(transformedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

export default categories;
