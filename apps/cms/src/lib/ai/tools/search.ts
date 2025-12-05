import { db } from "@astra/db";
import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const createSearchTool = (workspaceId: string) =>
  tool({
    description: "Search for posts, tags, or categories",
    inputSchema: z.object({
      query: z.string(),
      type: z.enum(["post", "tag", "category"]).optional(),
    }),
    execute: async ({ query, type }) => {
      try {
        const results: {
          posts?: unknown[];
          tags?: unknown[];
          categories?: unknown[];
        } = {};

        if (!type || type === "post") {
          results.posts = await db.post.findMany({
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
        }

        if (!type || type === "tag") {
          results.tags = await db.tag.findMany({
            where: {
              workspaceId,
              name: { contains: query, mode: "insensitive" },
            },
            take: 5,
          });
        }

        if (!type || type === "category") {
          results.categories = await db.category.findMany({
            where: {
              workspaceId,
              name: { contains: query, mode: "insensitive" },
            },
            take: 5,
          });
        }

        return { results };
      } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type SearchUIToolInvocation = UIToolInvocation<
  ReturnType<typeof createSearchTool>
>;
