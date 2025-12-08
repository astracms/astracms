import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Search for posts, tags, or categories
 */
export const createSearchTool = (workspaceId: string) =>
  createTool({
    id: "search",
    description:
      "Search for posts, tags, or categories by name, title, or description",
    inputSchema: z.object({
      query: z.string().describe("Search query string"),
      type: z
        .enum(["post", "tag", "category"])
        .optional()
        .describe("Filter by resource type, leave empty to search all"),
    }),
    outputSchema: z.object({
      results: z.object({
        posts: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              slug: z.string(),
              status: z.string(),
            })
          )
          .optional(),
        tags: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            })
          )
          .optional(),
        categories: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            })
          )
          .optional(),
      }),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { query, type } = context;
        const results: {
          posts?: { id: string; title: string; slug: string; status: string }[];
          tags?: { id: string; name: string; slug: string }[];
          categories?: { id: string; name: string; slug: string }[];
        } = {};

        if (!type || type === "post") {
          const posts = await db.post.findMany({
            where: {
              workspaceId,
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, title: true, slug: true, status: true },
          });
          results.posts = posts;
        }

        if (!type || type === "tag") {
          const tags = await db.tag.findMany({
            where: {
              workspaceId,
              name: { contains: query, mode: "insensitive" },
            },
            take: 5,
            select: { id: true, name: true, slug: true },
          });
          results.tags = tags;
        }

        if (!type || type === "category") {
          const categories = await db.category.findMany({
            where: {
              workspaceId,
              name: { contains: query, mode: "insensitive" },
            },
            take: 5,
            select: { id: true, name: true, slug: true },
          });
          results.categories = categories;
        }

        return { results };
      } catch (error: unknown) {
        return {
          results: {},
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
