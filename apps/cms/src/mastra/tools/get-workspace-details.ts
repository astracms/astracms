import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { CMSAgentContext } from "../agents/cms-agent";

/**
 * Enhanced tool to fetch a comprehensive snapshot of the workspace.
 * This aggregates posts, tags, categories, and analytics to provide the agent
 * with full context for generating relevant suggestions.
 */
export const createGetWorkspaceDetailsTool = (context: CMSAgentContext) =>
  createTool({
    id: "get-workspace-details",
    description: `Get a comprehensive summary of the current workspace.
Returns recent posts, available tags, categories, author list, and basic analytics.
Use this tool BEFORE generating suggestions to ensure they are relevant to the user's actual content.`,
    inputSchema: z.object({}),
    outputSchema: z.object({
      recentPosts: z.array(z.record(z.string(), z.unknown())),
      tags: z.array(z.record(z.string(), z.unknown())),
      categories: z.array(z.record(z.string(), z.unknown())),
      authors: z.array(z.record(z.string(), z.unknown())),
    }),
    execute: async () => {
      const workspaceId = context.workspaceId;

      // Parallel fetch for performance
      const [posts, tags, categories, authors] = await Promise.all([
        db.post.findMany({
          where: { workspaceId },
          take: 5,
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, slug: true, status: true },
        }),
        db.tag.findMany({
          where: { workspaceId },
          take: 10,
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        db.category.findMany({
          where: { workspaceId },
          take: 10,
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        db.author.findMany({
          where: { workspaceId },
          take: 5,
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
      ]);

      return {
        recentPosts: posts,
        tags,
        categories,
        authors,
      };
    },
  });
