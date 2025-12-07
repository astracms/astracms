/**
 * V2 Categories Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 */

import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
    CategoriesListResponseSchema,
    CategoriesQuerySchema,
    CategoryQuerySchema,
    CategoryResponseSchema,
} from "../../schemas/categories";
import {
    ErrorResponseSchema,
    ForbiddenResponseSchema,
    RateLimitResponseSchema,
    UnauthorizedResponseSchema,
} from "../../schemas/common";
import type { Env, Variables } from "../../types/env";

const v2Categories = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// V2 List categories route
const listCategoriesV2Route = createRoute({
    method: "get",
    path: "/",
    operationId: "listCategoriesV2",
    tags: ["Categories"],
    summary: "List categories",
    description: "Get a paginated list of categories with post counts",
    security: [{ ApiKeyAuth: [] }],
    request: {
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

v2Categories.openapi(listCategoriesV2Route, async (c) => {
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
        const limit = Number.parseInt(queryParams.limit, 10) || 10;
        const page = Number.parseInt(queryParams.page, 10) || 1;
        const db = createClient(c.env.DATABASE_URL);

        const totalCategories = await db.category.count({
            where: { workspaceId },
        });

        const totalPages = Math.ceil(totalCategories / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;
        const categoriesToSkip = limit ? (page - 1) * limit : 0;

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
                400
            );
        }

        const categoriesList = await db.category.findMany({
            where: { workspaceId },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                _count: {
                    select: {
                        posts: { where: { status: "published" } },
                    },
                },
            },
            take: limit,
            skip: categoriesToSkip,
        });

        const transformedCategories = categoriesList.map((category) => {
            const { _count, ...rest } = category;
            return { ...rest, count: _count };
        });

        return c.json(
            {
                categories: transformedCategories,
                pagination: {
                    limit,
                    currentPage: page,
                    nextPage,
                    previousPage: prevPage,
                    totalPages,
                    totalItems: totalCategories,
                },
            },
            200
        );
    } catch (error) {
        console.error("Error fetching categories:", error);
        return c.json({ error: "Failed to fetch categories" }, 500);
    }
});

// V2 Get single category route
const CategoryIdentifierParamV2Schema = z.object({
    identifier: z.string().openapi({
        param: { name: "identifier", in: "path" },
        example: "technology",
        description: "Category slug or ID",
    }),
});

const getCategoryV2Route = createRoute({
    method: "get",
    path: "/{identifier}",
    operationId: "getCategoryV2",
    tags: ["Categories"],
    summary: "Get a single category",
    description:
        "Get a single category by slug or ID, optionally including related posts",
    security: [{ ApiKeyAuth: [] }],
    request: {
        params: CategoryIdentifierParamV2Schema,
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
            description: "Category not found",
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

v2Categories.openapi(getCategoryV2Route, async (c) => {
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
        const queryParams = c.req.valid("query");
        const limit = Number.parseInt(queryParams.limit, 10) || 10;
        const page = Number.parseInt(queryParams.page, 10) || 1;
        const include = queryParams.include
            ? queryParams.include
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        const db = createClient(c.env.DATABASE_URL);

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
                        posts: { where: { status: "published" } },
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
                400
            );
        }

        const { _count, ...rest } = category;
        const transformedCategory = { ...rest, count: _count };

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
                        select: { id: true, name: true, image: true },
                    },
                    tags: {
                        select: { id: true, name: true, slug: true },
                    },
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                },
                orderBy: { publishedAt: "desc" },
                take: limit,
                skip: postsToSkip,
            });

            return c.json(
                {
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
                },
                200
            );
        }

        return c.json(transformedCategory, 200);
    } catch (error) {
        console.error("Error fetching category:", error);
        return c.json({ error: "Failed to fetch category" }, 500);
    }
});

export default v2Categories;
