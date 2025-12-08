import { db } from "@astra/db";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// MediaType values from database schema
type MediaType = "image" | "video" | "audio" | "document";

/**
 * List media files from the media library
 * Allows users to select cover images and inline images for blog posts
 */
export const createListMediaTool = (workspaceId: string) =>
  createTool({
    id: "list-media",
    description:
      "List images and media files from the media library. Use this when users need to select a cover image or add images to their blog post.",
    inputSchema: z.object({
      type: z
        .enum(["image", "video", "all"])
        .optional()
        .default("image")
        .describe("Type of media to list (default: image)"),
      limit: z
        .number()
        .optional()
        .default(12)
        .describe("Maximum number of items to return (default: 12)"),
      search: z
        .string()
        .optional()
        .describe("Optional search query to filter by file name"),
      cursor: z
        .string()
        .optional()
        .describe("Cursor for pagination (use lastId from previous response)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      media: z
        .array(
          z.object({
            id: z.string(),
            url: z.string(),
            name: z.string(),
            type: z.string(),
            size: z.number(),
            createdAt: z.string(),
          })
        )
        .optional(),
      hasMore: z.boolean().optional(),
      lastId: z.string().optional(),
      total: z.number().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const { type = "image", limit = 12, search, cursor } = context;

        // Build where clause
        const where: {
          workspaceId: string;
          type?: MediaType;
          name?: { contains: string; mode: "insensitive" };
          id?: { lt: string };
        } = { workspaceId };

        if (type !== "all") {
          where.type = type as MediaType;
        }

        if (search) {
          where.name = { contains: search, mode: "insensitive" };
        }

        if (cursor) {
          where.id = { lt: cursor };
        }

        // Fetch media with pagination
        const [media, total] = await Promise.all([
          db.media.findMany({
            where,
            take: limit + 1, // Fetch one extra to check if there's more
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              url: true,
              name: true,
              type: true,
              size: true,
              createdAt: true,
            },
          }),
          db.media.count({
            where: {
              workspaceId,
              type: type === "all" ? undefined : type,
            },
          }),
        ]);

        const hasMore = media.length > limit;
        const items = hasMore ? media.slice(0, -1) : media;
        const lastItem = items.at(-1);

        return {
          success: true,
          media: items.map((m) => ({
            id: m.id,
            url: m.url,
            name: m.name,
            type: m.type,
            size: m.size,
            createdAt: m.createdAt.toISOString(),
          })),
          hasMore,
          lastId: lastItem?.id,
          total,
        };
      } catch (error: unknown) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
