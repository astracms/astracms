import { db } from "@astra/db";
import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const createGetAnalyticsTool = (workspaceId: string) =>
  tool({
    description: "Get analytics for the workspace",
    inputSchema: z.object({
      metric: z
        .enum(["total_posts", "total_views", "published_vs_draft"])
        .describe("The metric to retrieve"),
    }),
    execute: async ({ metric }) => {
      try {
        if (metric === "total_posts") {
          const count = await db.post.count({
            where: { workspaceId },
          });
          return { metric: "Total Posts", value: count };
        }

        if (metric === "total_views") {
          const result = await db.post.aggregate({
            where: { workspaceId },
            _sum: {
              views: true,
            },
          });
          return { metric: "Total Views", value: result._sum.views ?? 0 };
        }

        if (metric === "published_vs_draft") {
          const result = await db.post.groupBy({
            by: ["status"],
            where: { workspaceId },
            _count: {
              status: true,
            },
          });

          const breakdown = result.reduce(
            (acc, curr) => {
              acc[curr.status] = curr._count.status;
              return acc;
            },
            {} as Record<string, number>
          );

          return { metric: "Published vs Draft", value: breakdown };
        }

        return { error: "Invalid metric" };
      } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type GetAnalyticsUIToolInvocation = UIToolInvocation<
  ReturnType<typeof createGetAnalyticsTool>
>;
