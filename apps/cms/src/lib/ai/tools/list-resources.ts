import { db } from "@astra/db";
import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const createListResourcesTool = (workspaceId: string) =>
  tool({
    description: "List posts, tags, or categories with pagination",
    inputSchema: z.object({
      type: z.enum(["post", "tag", "category"]),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(10),
    }),
    execute: async ({ type, page, limit }) => {
      try {
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

        return { error: "Invalid type" };
      } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type ListResourcesUIToolInvocation = UIToolInvocation<
  ReturnType<typeof createListResourcesTool>
>;
