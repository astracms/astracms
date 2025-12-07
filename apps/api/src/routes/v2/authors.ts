/**
 * V2 Authors Routes
 *
 * These routes use API key authentication instead of workspace ID in the URL.
 */

import { createClient } from "@astra/db";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
    AuthorQuerySchema,
    AuthorResponseSchema,
    AuthorsListResponseSchema,
    AuthorsQuerySchema,
} from "../../schemas/authors";
import {
    ErrorResponseSchema,
    ForbiddenResponseSchema,
    RateLimitResponseSchema,
    UnauthorizedResponseSchema,
} from "../../schemas/common";
import type { Env, Variables } from "../../types/env";

const v2Authors = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

// V2 List authors route
const listAuthorsV2Route = createRoute({
    method: "get",
    path: "/",
    operationId: "listAuthorsV2",
    tags: ["Authors"],
    summary: "List authors",
    description: "Get a paginated list of authors with post counts",
    security: [{ ApiKeyAuth: [] }],
    request: {
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

v2Authors.openapi(listAuthorsV2Route, async (c) => {
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

    const totalAuthors = await db.author.count({
        where: {
            workspaceId,
            coAuthoredPosts: { some: { status: "published" } },
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
            where: { workspaceId, isActive: true },
            select: {
                id: true,
                name: true,
                image: true,
                slug: true,
                bio: true,
                role: true,
                socials: { select: { url: true, platform: true } },
                _count: {
                    select: {
                        coAuthoredPosts: { where: { status: "published" } },
                    },
                },
            },
            orderBy: [{ name: "asc" }],
            take: limit,
            skip: authorsToSkip,
        });

        const transformedAuthors = authorsList.map((author) => {
            const { _count, ...rest } = author;
            return { ...rest, count: { posts: _count.coAuthoredPosts } };
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

// V2 Get single author route
const AuthorIdentifierParamV2Schema = z.object({
    identifier: z.string().openapi({
        param: { name: "identifier", in: "path" },
        example: "john-doe",
        description: "Author slug or ID",
    }),
});

const getAuthorV2Route = createRoute({
    method: "get",
    path: "/{identifier}",
    operationId: "getAuthorV2",
    tags: ["Authors"],
    summary: "Get a single author",
    description:
        "Get a single author by slug or ID, optionally including related posts",
    security: [{ ApiKeyAuth: [] }],
    request: {
        params: AuthorIdentifierParamV2Schema,
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
            description: "Author not found",
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

v2Authors.openapi(getAuthorV2Route, async (c) => {
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
                socials: { select: { url: true, platform: true } },
            },
        });

        if (!author) {
            return c.json({ error: "Author not found" }, 404);
        }

        const totalPosts = await db.post.count({
            where: {
                workspaceId,
                status: "published",
                authors: { some: { id: author.id } },
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
                    authors: { some: { id: author.id } },
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

export default v2Authors;
