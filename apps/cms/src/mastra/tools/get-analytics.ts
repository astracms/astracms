import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Get analytics metrics for the workspace
 */
export const createGetAnalyticsTool = (workspaceId: string) =>
  createTool({
    id: "get-analytics",
    description:
      "Get analytics metrics for the workspace (post counts, views, status breakdown)",
    inputSchema: z.object({
      metric: z
        .enum(["total_posts", "total_views", "published_vs_draft", "all"])
        .describe("The metric to retrieve. Use 'all' for a summary."),
    }),
    outputSchema: z.object({
      metrics: z.record(z.string(), z.unknown()),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { metric } = context;
        const metrics: Record<string, unknown> = {};

        if (metric === "total_posts" || metric === "all") {
          const count = await db.post.count({
            where: { workspaceId },
          });
          metrics.totalPosts = count;
        }

        if (metric === "total_views" || metric === "all") {
          const result = await db.post.aggregate({
            where: { workspaceId },
            _sum: { views: true },
          });
          metrics.totalViews = result._sum.views ?? 0;
        }

        if (metric === "published_vs_draft" || metric === "all") {
          const result = await db.post.groupBy({
            by: ["status"],
            where: { workspaceId },
            _count: { status: true },
          });

          const breakdown = result.reduce(
            (
              acc: Record<string, number>,
              curr: { status: string; _count: { status: number } }
            ) => {
              acc[curr.status] = curr._count.status;
              return acc;
            },
            {} as Record<string, number>
          );
          metrics.statusBreakdown = breakdown;
        }

        return { metrics };
      } catch (error: unknown) {
        return {
          metrics: {},
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
