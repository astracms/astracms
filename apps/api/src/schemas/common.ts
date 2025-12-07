import { z } from "@hono/zod-openapi";

// Shared error response schemas

export const ErrorResponseSchema = z
    .object({
        error: z.string().openapi({ example: "Bad Request" }),
        details: z.any().optional(),
        message: z.string().optional().openapi({ example: "Additional error context" }),
    })
    .openapi("ErrorResponse");

export const UnauthorizedResponseSchema = z
    .object({
        error: z.literal("Unauthorized").openapi({ example: "Unauthorized" }),
        message: z.string().openapi({ example: "Missing or invalid API key" }),
    })
    .openapi("UnauthorizedResponse");

export const ForbiddenResponseSchema = z
    .object({
        error: z.literal("Forbidden").openapi({ example: "Forbidden" }),
        message: z.string().openapi({ example: "Insufficient permissions for this resource" }),
    })
    .openapi("ForbiddenResponse");

export const RateLimitResponseSchema = z
    .object({
        error: z.literal("Too Many Requests").openapi({ example: "Too Many Requests" }),
        message: z.string().openapi({ example: "Rate limit exceeded. Please try again later." }),
        retryAfter: z.number().optional().openapi({ example: 60, description: "Seconds until rate limit resets" }),
    })
    .openapi("RateLimitResponse");

// Shared pagination schema
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
