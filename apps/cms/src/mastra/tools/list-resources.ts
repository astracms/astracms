import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * List posts, tags, or categories with pagination
 */
export const createListResourcesTool = (workspaceId: string) =>
  createTool({
    id: "list-resources",
    description: "List posts, tags, or categories with pagination support",
    inputSchema: z.object({
      type: z
        .enum(["post", "tag", "category"])
        .describe("Type of resource to list"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number (default: 1)"),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Items per page (default: 10)"),
    }),
    outputSchema: z.object({
      results: z.array(z.record(z.string(), z.unknown())),
      pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { type, page = 1, limit = 10 } = context;
        const skip = (page - 1) * limit;

        if (type === "post") {
          const [posts, total] = await Promise.all([
            db.post.findMany({
              where: { workspaceId },
              skip,
              take: limit,
              orderBy: { updatedAt: "desc" },
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                views: true,
                publishedAt: true,
              },
            }),
            db.post.count({ where: { workspaceId } }),
          ]);
          return {
            results: posts,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        }

        if (type === "tag") {
          const [tags, total] = await Promise.all([
            db.tag.findMany({
              where: { workspaceId },
              skip,
              take: limit,
              orderBy: { name: "asc" },
              select: { id: true, name: true, slug: true, description: true },
            }),
            db.tag.count({ where: { workspaceId } }),
          ]);
          return {
            results: tags,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        }

        if (type === "category") {
          const [categories, total] = await Promise.all([
            db.category.findMany({
              where: { workspaceId },
              skip,
              take: limit,
              orderBy: { name: "asc" },
              select: { id: true, name: true, slug: true, description: true },
            }),
            db.category.count({ where: { workspaceId } }),
          ]);
          return {
            results: categories,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          };
        }

        return {
          results: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          error: "Invalid resource type",
        };
      } catch (error: unknown) {
        return {
          results: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
