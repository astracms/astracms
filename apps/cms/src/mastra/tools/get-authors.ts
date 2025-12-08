import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Get authors for the workspace
 */
export const createGetAuthorsTool = (workspaceId: string) =>
  createTool({
    id: "get-authors",
    description: "List authors/contributors in the workspace",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Maximum number of authors to return"),
    }),
    outputSchema: z.object({
      authors: z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          slug: z.string(),
          bio: z.string().nullable(),
          postCount: z.number(),
        })
      ),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const authors = await db.author.findMany({
          where: { workspaceId },
          take: context.limit,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            _count: {
              select: { primaryPosts: true },
            },
          },
        });

        return {
          authors: authors.map((author) => ({
            id: author.id,
            name: author.name,
            slug: author.slug,
            bio: author.bio,
            postCount: author._count.primaryPosts,
          })),
        };
      } catch (error: unknown) {
        return {
          authors: [],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
